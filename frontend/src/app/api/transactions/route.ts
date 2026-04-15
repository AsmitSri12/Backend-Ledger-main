import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Account from '@/models/account';
import Transaction from '@/models/transaction';
import dbConnect from '@/lib/db';

function getUserIdFromToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const userAccounts = await Account.find({ user: userId }).select('_id');
    const accountIds = userAccounts.map((acc) => acc._id);

    const transactions = await Transaction.find({
      $or: [{ fromAccount: { $in: accountIds } }, { toAccount: { $in: accountIds } }],
    })
      .sort({ createdAt: -1 })
      .populate('fromAccount', 'currency status')
      .populate('toAccount', 'currency status');

    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { fromAccount, toAccount, amount, idempotencyKey } = await request.json();

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: 'fromAccount, toAccount, amount and idempotencyKey are required!' },
        { status: 400 }
      );
    }

    const fromUserAccount = await Account.findById(fromAccount).session(session);
    const toUserAccount = await Account.findById(toAccount).session(session);

    if (!fromUserAccount || !toUserAccount) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ message: 'Invalid fromAccount or toAccount' }, { status: 400 });
    }

    const existingTransaction = await Transaction.findOne({ idempotencyKey }).session(session);

    if (existingTransaction) {
      if (existingTransaction.status === 'COMPLETED') {
        await session.commitTransaction();
        session.endSession();
        return NextResponse.json(
          { message: 'Transaction already proceeded', transaction: existingTransaction },
          { status: 200 }
        );
      }
      if (existingTransaction.status === 'PENDING') {
        await session.commitTransaction();
        session.endSession();
        return NextResponse.json({ message: 'Transaction is still Processing' }, { status: 202 });
      }
    }

    if (fromUserAccount.status !== 'ACTIVE' || toUserAccount.status !== 'ACTIVE') {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: 'Both accounts must be ACTIVE to process transaction' },
        { status: 400 }
      );
    }

    const balance = await fromUserAccount.getBalance();

    const User = (await import('@/models/user')).default;
    const user = await User.findById(userId);
    const isUnlimited = user?.role === 'ADMIN' || user?.systemUser === true;

    if (!isUnlimited && balance < amount) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: `Insufficient Balance. Current balance is ${balance}. Requested amount is ${amount}` },
        { status: 400 }
      );
    }

    const Ledger = (await import('@/models/ledger')).default;
    
    const [transaction] = await Transaction.create(
      [
        {
          fromAccount,
          toAccount,
          amount,
          idempotencyKey,
          status: 'PENDING',
        },
      ],
      { session }
    );

    await Ledger.create(
      [
        {
          account: fromAccount,
          amount,
          transaction: transaction._id,
          type: 'DEBIT',
        },
      ],
      { session }
    );

    await new Promise((resolve) => setTimeout(resolve, 500));

    await Ledger.create(
      [
        {
          account: toAccount,
          amount,
          transaction: transaction._id,
          type: 'CREDIT',
        },
      ],
      { session }
    );

    await Transaction.findByIdAndUpdate(
      transaction._id,
      { status: 'COMPLETED' },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      { message: 'Transaction completed successfully', transaction },
      { status: 201 }
    );
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json(
      { message: 'Transaction is Pending due to some issue, Please try after some time.' },
      { status: 400 }
    );
  }
}
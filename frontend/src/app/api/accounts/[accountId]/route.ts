import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Account from '@/models/account';
import dbConnect from '@/lib/db';

function getUserIdFromToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ accountId: string }> }) {
  try {
    await dbConnect();
    const { accountId } = await params;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const account = await Account.findOne({ _id: accountId, user: userId });

    if (!account) {
      return NextResponse.json({ message: 'Account not found' }, { status: 404 });
    }

    const balance = await account.getBalance();

    return NextResponse.json({ accountId: account._id, balance });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ accountId: string }> }) {
  try {
    await dbConnect();
    const { accountId } = await params;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const account = await Account.findOne({ _id: accountId, user: userId });

    if (!account) {
      return NextResponse.json({ message: 'Account not found' }, { status: 404 });
    }

    const Ledger = (await import('@/models/ledger')).default;
    await Ledger.deleteMany({ account: accountId });
    await Account.findByIdAndDelete(accountId);

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
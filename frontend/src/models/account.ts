import mongoose, { Schema, models, model } from 'mongoose';

const ledgerSchema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
    required: [true, 'Ledger must be associated with an account'],
    index: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required for creating a ledger entry'],
  },
  transaction: {
    type: Schema.Types.ObjectId,
    ref: 'transaction',
    required: [true, 'Ledger must be associated with a transaction'],
    index: true,
  },
  type: {
    type: String,
    enum: {
      values: ['CREDIT', 'DEBIT'],
      message: 'Type can either be CREDIT or DEBIT',
    },
    required: [true, 'Ledger type is required'],
  },
});

const Ledger = models.Ledger || model('Ledger', ledgerSchema);

const accountSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Account must be associated with a user.'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'FROZEN', 'CLOSED'],
        message: 'Status can be either ACTIVE, FROZEN or CLOSED',
      },
      default: 'ACTIVE',
    },
    currency: {
      type: String,
      required: [true, 'Currency is required for creating an account.'],
      default: 'INR',
    },
  },
  {
    timestamps: true,
  }
);

accountSchema.index({ user: 1, status: 1 });

accountSchema.methods.getBalance = async function () {
  const balanceData = await Ledger.aggregate([
    {
      $match: { account: this._id },
    },
    {
      $group: {
        _id: null,
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ['$type', 'DEBIT'] }, '$amount', 0],
          },
        },
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ['$type', 'CREDIT'] }, '$amount', 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        balance: { $subtract: ['$totalCredit', '$totalDebit'] },
      },
    },
  ]);
  if (balanceData.length === 0) {
    return 0;
  }
  return balanceData[0].balance;
};

const Account = models.Account || model('Account', accountSchema);

export default Account;
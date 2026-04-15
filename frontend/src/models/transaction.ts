import mongoose, { Schema, models, model } from 'mongoose';

const transactionSchema = new Schema(
  {
    fromAccount: {
      type: Schema.Types.ObjectId,
      ref: 'account',
      required: [true, 'Transaction must be associated with a from account'],
      index: true,
    },
    toAccount: {
      type: Schema.Types.ObjectId,
      ref: 'account',
      required: [true, 'Transaction must be associated with a to account'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'],
        message: 'Status can either be PENDING, COMPLETED, FAILED or REVERSED',
      },
      default: 'PENDING',
    },
    amount: {
      type: Number,
      required: 'Account is required for creating a transaction',
      min: [0, 'Transaction amount cannot be negative'],
    },
    idempotencyKey: {
      type: String,
      required: [true, 'Idempotency Key is required for creating a transaction'],
      index: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = models.Transaction || model('Transaction', transactionSchema);

export default Transaction;
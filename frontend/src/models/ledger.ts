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

export default Ledger;
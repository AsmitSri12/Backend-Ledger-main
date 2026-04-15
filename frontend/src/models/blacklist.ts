import mongoose, { Schema, models, model } from 'mongoose';

const blackListSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400,
  },
});

const BlackList = models.BlackList || model('BlackList', blackListSchema);

export default BlackList;
const { z } = require("zod");
const mongoose = require("mongoose");

const objectIdValidator = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

const transactionSchema = z.object({
  body: z.object({
    fromAccount: objectIdValidator,
    toAccount: objectIdValidator,
    amount: z.number().positive("Amount must be a positive number"),
    idempotencyKey: z.string().min(1, "Idempotency key is required"),
  }),
});

const initialFundsSchema = z.object({
  body: z.object({
    toAccount: objectIdValidator,
    amount: z.number().positive("Amount must be a positive number"),
    idempotencyKey: z.string().min(1, "Idempotency key is required"),
  }),
});

module.exports = {
  transactionSchema,
  initialFundsSchema,
};

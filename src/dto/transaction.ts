import type { Schema } from "express-validator";

const defaultTransactionDto: Schema = {
  amount: {
    in: "body",
    isInt: true,
  },
  sender: {
    in: "body",
    isString: true,
  },
  recipient: {
    in: "body",
    isString: true,
  },
};

export const transactionDto: Schema = {
  ...defaultTransactionDto,
  transactionId: {
    in: "body",
    isString: true,
    optional: true,
  },
};

export const transactionBroadcastDto: Schema = {
  ...defaultTransactionDto,
};

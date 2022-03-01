import type { Schema } from "express-validator";

export const transactionDto: Schema = {
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

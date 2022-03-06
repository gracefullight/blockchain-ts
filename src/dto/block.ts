import type { Schema } from "express-validator";

export const blockDto: Schema = {
  newBlock: {
    in: "body",
    isObject: true,
  },
};

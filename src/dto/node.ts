import type { Schema } from "express-validator";

export const nodeDto: Schema = {
  newNodeUrl: {
    in: "body",
    isURL: true,
  },
};

export const nodeBulkDto: Schema = {
  allNetworkNodes: {
    in: "body",
    isArray: true,
  },
  "allNetworkNodes.*": {
    in: "body",
    isURL: true,
  },
};

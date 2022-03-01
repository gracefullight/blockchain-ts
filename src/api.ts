import express, { Request, Response } from "express";
import { checkSchema, validationResult } from "express-validator";
import helmet from "helmet";

import { Blockchain } from "./blockchain";
import { transactionDto } from "./dto";

const blockChain = new Blockchain();

const app = express();
app.use(helmet());
app.use(express.json());

app.get("/blockchain", (req, res) => {
  res.send(blockChain);
});

app.post(
  "/transaction",
  checkSchema(transactionDto),
  (req: Request, res: Response) => {
    validationResult(req).throw();

    const blockIndex = blockChain.createNewTransaction(
      req.body.amount,
      req.body.sender,
      req.body.recipient
    );

    res.json({ note: `Transaction will be added in Block ${blockIndex}` });
  }
);

app.get("/mine", (req, res) => {});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});

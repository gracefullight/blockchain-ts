import express, { Request, Response } from "express";
import { checkSchema, validationResult } from "express-validator";
import helmet from "helmet";

import { Blockchain } from "./blockchain";
import { transactionDto } from "./dto";
import { uuid } from "./utils";

const port = process.argv[2];
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

app.get("/mine", (req, res) => {
  const { hash: previousBlockHash, index: lastBlockIndex } =
    blockChain.getLastBlock();

  const currentBlockData = {
    transactions: blockChain.pendingTransactions,
    index: lastBlockIndex + 1,
  };

  const nonce = blockChain.proofOfWork(previousBlockHash, currentBlockData);
  const hash = blockChain.hashBlock(previousBlockHash, currentBlockData, nonce);
  const newBlock = blockChain.createNewBlock(nonce, previousBlockHash, hash);

  const nodeAddress = uuid().replace('-', '');
  blockChain.createNewTransaction(12.5, "00", nodeAddress);

  res.json({
    note: "New block mined successfully",
    block: newBlock,
  });
});

app.listen(port || 3000, () => {
  console.log(`server is running on port ${port}`);
});

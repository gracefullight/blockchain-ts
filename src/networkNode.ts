import axios from "axios";
import express, { Request, Response } from "express";
import h from "express-async-handler";
import { checkSchema } from "express-validator";
import helmet from "helmet";

import { Blockchain } from "./blockchain";
import {
  blockDto,
  nodeBulkDto,
  nodeDto,
  transactionBroadcastDto,
  transactionDto,
} from "./dto";
import type { Block, Transaction, TransactionDto } from "./types";
import { uuid } from "./utils";

process.env.PORT = process.argv[2];
const currentNodeUrl = process.argv[3];
const blockChain = new Blockchain(
  currentNodeUrl || `http://localhost:${process.env.PORT}`
);

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
    const { amount, sender, recipient, transactionId } =
      req.body as Transaction;

    const blockIndex = blockChain.addTransactionToPendingTransactions({
      amount,
      sender,
      recipient,
      transactionId,
    });

    res.json({ note: `Transaction will be added in Block ${blockIndex}` });
  }
);

app.post(
  "/transaction/broadcast",
  checkSchema(transactionBroadcastDto),
  h(async (req: Request, res: Response) => {
    const { amount, sender, recipient } = req.body as TransactionDto;
    const newTransaction = blockChain.createNewTransaction(
      amount,
      sender,
      recipient
    );

    blockChain.addTransactionToPendingTransactions(newTransaction);
    const p = blockChain.networkNodes.map((nodeUrl) =>
      axios.post(`${nodeUrl}/transaction`, newTransaction)
    );
    await Promise.all(p);

    res.json({ note: "Transaction created and broadcast successfully." });
  })
);

app.get(
  "/mine",
  h(async (req, res) => {
    const { hash: previousBlockHash, index: lastBlockIndex } =
      blockChain.getLastBlock();

    const currentBlockData = {
      transactions: blockChain.pendingTransactions,
      index: lastBlockIndex + 1,
    };

    const nonce = blockChain.proofOfWork(previousBlockHash, currentBlockData);
    const hash = blockChain.hashBlock(
      previousBlockHash,
      currentBlockData,
      nonce
    );
    const newBlock = blockChain.createNewBlock(nonce, previousBlockHash, hash);

    const p = blockChain.networkNodes.map((nodeUrl) =>
      axios.post(`${nodeUrl}/receive-new-block`, { newBlock })
    );
    await Promise.all(p);

    const nodeAddress = uuid().replaceAll("-", "");
    await axios.post(`${blockChain.currentNodeUrl}/transaction/broadcast`, {
      amount: 12.5,
      sender: "00",
      recipient: nodeAddress,
    });

    res.json({
      note: "New block mined successfully",
      block: newBlock,
    });
  })
);

app.post(
  "/register-and-broadcast-node",
  checkSchema(nodeDto),
  h(async (req: Request, res: Response) => {
    const newNodeUrl = req.body.newNodeUrl;
    if (!blockChain.networkNodes.includes(newNodeUrl)) {
      blockChain.networkNodes.push(newNodeUrl);
    }

    const p = blockChain.networkNodes.map((nodeUrl: string) =>
      axios.post(nodeUrl + "/register-node", { newNodeUrl })
    );

    await Promise.all(p);
    await axios.post(`${newNodeUrl}/register-nodes-bulk`, {
      allNetworkNodes: [...blockChain.networkNodes, blockChain.currentNodeUrl],
    });

    res.json({ note: "New node registered with network successfully" });
  })
);

app.post(
  "/register-node",
  checkSchema(nodeDto),
  (req: Request, res: Response) => {
    const newNodeUrl = req.body.newNodeUrl;
    if (
      !blockChain.networkNodes.includes(newNodeUrl) &&
      blockChain.currentNodeUrl !== newNodeUrl
    ) {
      blockChain.networkNodes.push(newNodeUrl);
    }

    res.json({ note: "New node registered successfully" });
  }
);

app.post(
  "/register-nodes-bulk",
  checkSchema(nodeBulkDto),
  (req: Request, res: Response) => {
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach((nodeUrl: string) => {
      if (
        !blockChain.networkNodes.includes(nodeUrl) &&
        nodeUrl !== blockChain.currentNodeUrl
      ) {
        blockChain.networkNodes.push(nodeUrl);
      }
    });

    res.json({ note: "Bulk registration successful." });
  }
);

app.post(
  "/receive-new-block",
  checkSchema(blockDto),
  (req: Request, res: Response) => {
    const newBlock = req.body.newBlock as Block;
    const lastBlock = blockChain.getLastBlock();

    if (
      lastBlock.hash === newBlock.previousBlockHash &&
      lastBlock.index + 1 === newBlock.index
    ) {
      blockChain.chain.push(newBlock);
      blockChain.pendingTransactions = [];
      res.json({ note: "New block received and accepted.", newBlock });
    } else {
      res.json({ note: "New block rejected.", newBlock });
    }
  }
);

app.get(
  "/consensus",
  h(async (_: Request, res: Response) => {
    const p = blockChain.networkNodes.map((nodeUrl) =>
      axios.get<Blockchain>(`${nodeUrl}/blockchain`)
    );

    const currentChainLength = blockChain.chain.length;
    let maxChainLength = currentChainLength;
    let newLongestChain = null;
    let newPendingTransactions: Transaction[] = [];

    const responses = await Promise.all(p);
    responses
      .map(({ data }) => data)
      .forEach((chain) => {
        if (chain.chain.length > maxChainLength) {
          maxChainLength = chain.chain.length;
          newLongestChain = chain.chain;
          newPendingTransactions = chain.pendingTransactions;
        }
      });

    if (
      !newLongestChain ||
      (newLongestChain && !blockChain.chainIsValid(newLongestChain))
    ) {
      res.json({
        note: "Current chain has not been replaced.",
        chain: blockChain.chain,
      });
    } else {
      blockChain.chain = newLongestChain;
      blockChain.pendingTransactions = newPendingTransactions;
      res.json({
        note: "This chain has been replaced.",
        chain: blockChain.chain,
      });
    }
  })
);

app.get("/block/:blockHash", (req, res) => {
  const blockHash = req.params.blockHash;
  const block = blockChain.getBlock(blockHash);
  res.json({ block });
});

app.get("/transaction/:transactionId", (req, res) => {
  const transactionId = req.params.transactionId;
  const { transaction, block } = blockChain.getTransaction(transactionId);
  res.json({ transaction, block });
});

app.get("/address/:address", (req, res) => {
  const address = req.params.address;
  const addressData = blockChain.getAddressData(address);
  res.json({ addressData });
});

app.get("/block-explorer", (_, res) => {
  res.sendFile("./block-explorer/index.html", { root: __dirname });
});

export default app;

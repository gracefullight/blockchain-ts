import type { Block, Transaction } from "./types";
import { sha256 } from "./utils";
export class Blockchain {
  private chain: Block[] = [];
  private pendingTransactions: Transaction[] = [];

  public createNewBlock(
    nonce: string,
    previousBlockHash: string,
    hash: string
  ) {
    const newBlock = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.pendingTransactions,
      nonce,
      hash,
      previousBlockHash,
    };
    this.pendingTransactions = [];
    this.chain.push(newBlock);
    return newBlock;
  }

  public getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  public createNewTransaction(
    amount: number,
    sender: string,
    recipient: string
  ) {
    this.pendingTransactions.push({ amount, sender, recipient });
    return this.getLastBlock()["index"] + 1;
  }

  public hashBlock(
    previousBlockHash: string,
    currentBlockData: Transaction[],
    nonce: string
  ) {
    const dataAsString =
      previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);
    return hash;
  }
}

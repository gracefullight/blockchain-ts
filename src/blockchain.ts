import type { Block, BlockData, Transaction } from "./types";
import { sha256 } from "./utils";

export const GENESIS_BLOCK_HASH = "0".repeat(32);

export class Blockchain {
  private chain: Block[] = [];
  pendingTransactions: Transaction[] = [];
  networkNodes: string[] = [];
  currentNodeUrl: string;

  constructor(currentNodeUrl: string) {
    this.createNewBlock(100, GENESIS_BLOCK_HASH, GENESIS_BLOCK_HASH);
    this.currentNodeUrl = currentNodeUrl;
  }

  public createNewBlock(
    nonce: number,
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
    currentBlockData: BlockData,
    nonce: number
  ) {
    const dataAsString =
      previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);
    return hash;
  }

  public proofOfWork(previousBlockHash: string, currentBlockData: BlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    while (hash.substring(0, 4) !== "0000") {
      nonce++;
      hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }
    return nonce;
  }
}

import type { Block, BlockData, Transaction } from "./types";
import { sha256, uuid } from "./utils";

export const GENESIS_BLOCK_HASH = "0".repeat(32);

export class Blockchain {
  chain: Block[] = [];
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
    const newTransaction = {
      amount,
      sender,
      recipient,
      transactionId: uuid().replaceAll("-", ""),
    };
    this.pendingTransactions.push(newTransaction);
    return newTransaction;
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

  public addTransactionToPendingTransactions(transaction: Transaction) {
    this.pendingTransactions.push(transaction);
    return this.getLastBlock()["index"] + 1;
  }

  public chainIsValid(blockchain: Block[]) {
    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock.nonce === 100;
    const correctPreviousBlockHash =
      genesisBlock.previousBlockHash === GENESIS_BLOCK_HASH;
    const correctHash = genesisBlock.hash === GENESIS_BLOCK_HASH;
    const correctTransactions = genesisBlock.transactions.length === 0;

    if (
      !correctNonce ||
      !correctPreviousBlockHash ||
      !correctHash ||
      !correctTransactions
    ) {
      return false;
    }

    let validChain = true;
    for (let i = 1; i < blockchain.length; i++) {
      const currentBlock = blockchain[i];
      const previousBlock = blockchain[i - 1];
      const blockHash = this.hashBlock(
        previousBlock.hash,
        { transactions: currentBlock.transactions, index: currentBlock.index },
        currentBlock.nonce
      );
      if (blockHash.substring(0, 4) !== "0000") {
        validChain = false;
        break;
      }
      if (currentBlock.previousBlockHash !== previousBlock.hash) {
        validChain = false;
        break;
      }
    }

    return validChain;
  }

  public getBlock(blockHash: string) {
    const correctBlock = this.chain.find((block) => block.hash === blockHash);
    return correctBlock;
  }

  public getTransaction(transactionId: string) {
    let block: Block | undefined;
    let transaction: Transaction | undefined;
    this.chain.forEach((_block) => {
      const _transaction = _block.transactions.find(
        (transaction) => transaction.transactionId === transactionId
      );

      if (_transaction) {
        block = _block;
        transaction = _transaction;
        return;
      }
    });

    return {
      block,
      transaction,
    };
  }

  public getAddressData(address: string) {
    const addressTransactions: Transaction[] = [];
    this.chain.forEach((block) => {
      block.transactions.forEach((transaction) => {
        if (
          transaction.sender === address ||
          transaction.recipient === address
        ) {
          addressTransactions.push(transaction);
        }
      });
    });

    let addressBalance = 0;
    addressTransactions.forEach((transaction) => {
      if (transaction.sender === address) {
        addressBalance -= transaction.amount;
      } else if (transaction.recipient === address) {
        addressBalance += transaction.amount;
      }
    });

    return {
      addressTransactions,
      addressBalance,
    };
  }
}

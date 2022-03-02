export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  nonce: number;
  hash: string;
  previousBlockHash: string;
}

export interface Transaction {
  amount: number;
  sender: string;
  recipient: string;
  transactionId: string;
}

export type TransactionDto = Omit<Transaction, "transactionId">;

export type BlockData = Partial<Block>;

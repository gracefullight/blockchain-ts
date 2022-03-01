export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  nonce: string;
  hash: string;
  previousBlockHash: string;
}

export interface Transaction {
  amount: number;
  sender: string;
  recipient: string;
}

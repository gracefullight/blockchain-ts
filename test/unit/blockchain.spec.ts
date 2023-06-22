import { faker } from "@faker-js/faker";

import { Blockchain, GENESIS_BLOCK_HASH } from "../../src/blockchain";

const NONCE = 0;
const SENDER = "gracefullight";
const RECIPIENT = "github";

describe("BlockChain", () => {
  let blockChain: Blockchain;
  beforeEach(() => {
    blockChain = new Blockchain("http://localhost:3000");
  });

  it("should be initialize with nodeUrl", () => {
    expect(blockChain.currentNodeUrl).toBe("http://localhost:3000");
  });

  describe("@createNewBlock", () => {
    it("has genesis block", () => {
      const genesisBlock = Reflect.get(blockChain, "chain")[0];

      expect(genesisBlock).toHaveProperty("index", 1);
      expect(genesisBlock).toHaveProperty(
        "previousBlockHash",
        GENESIS_BLOCK_HASH
      );
      expect(genesisBlock).toHaveProperty("hash", GENESIS_BLOCK_HASH);
    });
  });

  describe("@getLatestBlock", () => {
    it("should be return latest block", () => {
      const hash = faker.git.commitSha();
      blockChain.createNewBlock(NONCE, GENESIS_BLOCK_HASH, hash);

      const { timestamp, ...lastBlockExceptTimestamp } =
        blockChain.getLastBlock();
      expect(lastBlockExceptTimestamp).toEqual({
        index: 2,
        nonce: NONCE,
        transactions: [],
        hash,
        previousBlockHash: GENESIS_BLOCK_HASH,
      });
    });
  });

  describe("@createNewTransaction", () => {
    it("should be add new transaction to the second (next) block", () => {
      const hash = faker.git.commitSha();
      const transaction = blockChain.createNewTransaction(
        1000,
        "gracefullight",
        "github"
      );

      expect(transaction).toHaveProperty("amount");
      expect(transaction).toHaveProperty("sender");
      expect(transaction).toHaveProperty("recipient");
      expect(transaction).toHaveProperty("transactionId");

      const { transactions } = blockChain.createNewBlock(
        NONCE,
        GENESIS_BLOCK_HASH,
        hash
      );

      expect(transactions).toHaveLength(1);
    });

    describe("if add multiple transactions", () => {
      it("should be add pendingTransactions", () => {
        blockChain.createNewTransaction(1000, SENDER, RECIPIENT);
        blockChain.createNewTransaction(2000, SENDER, RECIPIENT);
        blockChain.createNewTransaction(3000, SENDER, RECIPIENT);

        expect(blockChain.pendingTransactions).toHaveLength(3);
      });
    });
  });

  describe("@hashBlock", () => {
    it("should be return sha256 hash of block", () => {
      const previousBlockHash = faker.git.commitSha();
      const blockHash = blockChain.hashBlock(
        previousBlockHash,
        {
          transactions: [
            {
              amount: 1000,
              sender: SENDER,
              recipient: RECIPIENT,
              transactionId: faker.datatype.uuid().replaceAll("-", ""),
            },
            {
              amount: 2000,
              sender: SENDER,
              recipient: RECIPIENT,
              transactionId: faker.datatype.uuid().replaceAll("-", ""),
            },
            {
              amount: 3000,
              sender: SENDER,
              recipient: RECIPIENT,
              transactionId: faker.datatype.uuid().replaceAll("-", ""),
            },
          ],
        },
        NONCE
      );

      expect(blockHash).toMatch(/^[a-z0-9]{64}$/);
    });
  });

  describe("@addTransactionToPendingTransactions", () => {
    it("should be add pendingTransactions", () => {
      const newBlockIndex = blockChain.addTransactionToPendingTransactions({
        amount: 1000,
        sender: SENDER,
        recipient: RECIPIENT,
        transactionId: faker.datatype.uuid().replaceAll("-", ""),
      });

      expect(newBlockIndex).toBe(2);
      expect(blockChain.pendingTransactions).toHaveLength(1);
    });
  });
});

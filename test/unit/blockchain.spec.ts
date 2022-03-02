import { faker } from "@faker-js/faker";

import { Blockchain, GENESIS_BLOCK_HASH } from "../../src/blockchain";

const NONCE = 0;

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
      const nextBlockIndex = blockChain.createNewTransaction(
        1000,
        "gracefullight",
        "github"
      );
      expect(nextBlockIndex).toBe(2);

      const { transactions } = blockChain.createNewBlock(
        NONCE,
        GENESIS_BLOCK_HASH,
        hash
      );

      expect(transactions).toEqual([
        {
          amount: 1000,
          sender: "gracefullight",
          recipient: "github",
        },
      ]);
    });

    describe("if add multiple transactions", () => {
      it("should be add pendingTransactions", () => {
        const sender = "gracefullight";
        const recipient = "github";
        blockChain.createNewTransaction(1000, sender, recipient);
        blockChain.createNewTransaction(2000, sender, recipient);
        blockChain.createNewTransaction(3000, sender, recipient);

        expect(Reflect.get(blockChain, "pendingTransactions")).toEqual([
          {
            amount: 1000,
            sender,
            recipient,
          },
          {
            amount: 2000,
            sender,
            recipient,
          },
          {
            amount: 3000,
            sender,
            recipient,
          },
        ]);
      });
    });
  });

  describe("@hashBlock", () => {
    it("should be return sha256 hash of block", () => {
      const previousBlockHash = faker.git.commitSha();
      const sender = "gracefullight";
      const recipient = "github";
      const blockHash = blockChain.hashBlock(
        previousBlockHash,
        {
          transactions: [
            {
              amount: 1000,
              sender,
              recipient,
            },
            {
              amount: 2000,
              sender,
              recipient,
            },
            {
              amount: 3000,
              sender,
              recipient,
            },
          ],
        },
        NONCE
      );

      expect(blockHash).toMatch(/^[a-z0-9]{64}$/);
    });
  });
});

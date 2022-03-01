import { Blockchain } from "./blockchain";
import { faker } from "@faker-js/faker";

const NONCE = 0;
const GENESIS_BLOCK_HASH = "0".repeat(32);

describe("BlockChain", () => {
  let blockChain: Blockchain;
  beforeEach(() => {
    blockChain = new Blockchain();
  });

  describe("@createNewBlock", () => {
    it("should be add genesis block", () => {
      const hash = faker.git.commitSha();
      const { timestamp, ...genesisBlockExceptTimestamp } =
        blockChain.createNewBlock(NONCE, GENESIS_BLOCK_HASH, hash);

      expect(genesisBlockExceptTimestamp).toEqual({
        index: 1,
        nonce: "gracefullight",
        transactions: [],
        hash,
        previousBlockHash: GENESIS_BLOCK_HASH,
      });
    });
  });

  describe("@getLatestBlock", () => {
    it("should be return latest block", () => {
      const hash = faker.git.commitSha();
      const secondBlockHash = faker.git.commitSha();
      blockChain.createNewBlock(NONCE, GENESIS_BLOCK_HASH, hash);
      blockChain.createNewBlock(NONCE, hash, secondBlockHash);

      const { timestamp, ...lastBlockExceptTimestamp } =
        blockChain.getLastBlock();
      expect(lastBlockExceptTimestamp).toEqual({
        index: 2,
        nonce: NONCE,
        transactions: [],
        hash: secondBlockHash,
        previousBlockHash: hash,
      });
    });
  });

  describe("@createNewTransaction", () => {
    it("should be add new transaction to the second (next) block", () => {
      const hash = faker.git.commitSha();
      const secondBlockHash = faker.git.commitSha();
      blockChain.createNewBlock(NONCE, GENESIS_BLOCK_HASH, hash);
      const nextBlockIndex = blockChain.createNewTransaction(
        1000,
        "gracefullight",
        "github"
      );
      expect(nextBlockIndex).toBe(2);

      const { transactions } = blockChain.createNewBlock(
        NONCE,
        hash,
        secondBlockHash
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
        const hash = faker.git.commitSha();
        blockChain.createNewBlock(NONCE, GENESIS_BLOCK_HASH, hash);

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
        [
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
        NONCE
      );

      expect(blockHash).toMatch(/^[a-z0-9]{64}$/);
    });
  });
});

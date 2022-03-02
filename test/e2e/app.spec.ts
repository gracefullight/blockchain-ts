import request from "supertest";

import app from "../../src/networkNode";

describe("App E2E", () => {
  describe("GET /blockchain", () => {
    it("should be return the chain", async () => {
      const res = await request(app).get("/blockchain");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("chain");
      expect(res.body).toHaveProperty("pendingTransactions");
      expect(res.body).toHaveProperty("networkNodes");
      expect(res.body).toHaveProperty("currentNodeUrl");
    });
  });
});

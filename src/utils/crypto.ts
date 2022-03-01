import { createHash, randomUUID, RandomUUIDOptions } from "crypto";

export const sha256 = (data: string): string => {
  const hash = createHash("sha256");
  hash.update(data);
  return hash.digest("hex");
};

export const uuid = (options?: RandomUUIDOptions): string => {
  return randomUUID(options);
};

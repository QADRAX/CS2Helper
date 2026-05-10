import { createHash } from "node:crypto";

/**
 * Deterministic storage digest for an opaque refresh token (hex).
 */
export function refreshTokenStorageHash(plainRefreshToken: string): string {
  return createHash("sha256").update(plainRefreshToken, "utf8").digest("hex");
}

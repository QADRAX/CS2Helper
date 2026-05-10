import { describe, expect, it } from "vitest";
import { encodeOpaqueRefreshToken } from "../encodeOpaqueRefreshToken";

describe("encodeOpaqueRefreshToken", () => {
  it("encodes bytes as base64url", () => {
    const bytes = new Uint8Array([1, 2, 3, 252]);
    expect(encodeOpaqueRefreshToken(bytes)).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

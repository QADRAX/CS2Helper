import { describe, expect, it } from "vitest";
import { refreshTokenStorageHash } from "../refreshTokenHash";

describe("refreshTokenStorageHash", () => {
  it("is deterministic for the same input", () => {
    const plain = "opaque-token";
    expect(refreshTokenStorageHash(plain)).toBe(refreshTokenStorageHash(plain));
  });

  it("differs for different inputs", () => {
    expect(refreshTokenStorageHash("a")).not.toBe(refreshTokenStorageHash("b"));
  });

  it("produces hex string", () => {
    expect(refreshTokenStorageHash("x")).toMatch(/^[0-9a-f]{64}$/);
  });
});

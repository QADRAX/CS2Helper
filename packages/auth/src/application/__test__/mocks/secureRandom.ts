import { vi } from "vitest";
import type { SecureRandomPort } from "../../ports";

export function createSecureRandomFake(bytes = new Uint8Array(32).fill(9)): SecureRandomPort {
  return {
    randomBytes: vi.fn((len: number) => {
      const out = new Uint8Array(len);
      out.set(bytes.subarray(0, Math.min(len, bytes.length)));
      return out;
    }),
  };
}

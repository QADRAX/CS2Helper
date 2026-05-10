import { vi } from "vitest";
import type { PasswordHasherPort } from "../../ports";

export function createPasswordHasherFake(
  overrides: Partial<PasswordHasherPort> = {}
): PasswordHasherPort {
  return {
    hash: vi.fn(async () => "hashed-password"),
    verify: vi.fn(async () => true),
    ...overrides,
  };
}

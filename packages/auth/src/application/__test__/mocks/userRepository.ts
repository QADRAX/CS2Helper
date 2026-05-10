import { vi } from "vitest";
import type { UserRepositoryPort } from "../../ports";

export function createUserRepositoryFake(
  overrides: Partial<UserRepositoryPort> = {}
): UserRepositoryPort {
  return {
    createUser: vi.fn(async () => ({ id: "u1" })),
    findWithPasswordByEmail: vi.fn(async () => null),
    findById: vi.fn(async () => null),
    ...overrides,
  };
}

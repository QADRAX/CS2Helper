import { vi } from "vitest";
import type { UserRepositoryPort } from "../../ports";

export function createUserRepositoryFake(
  overrides: Partial<UserRepositoryPort> = {}
): UserRepositoryPort {
  return {
    createUser: vi.fn(async () => ({ id: "u1" })),
    findBySteamId: vi.fn(async () => null),
    findById: vi.fn(async () => null),
    listUsers: vi.fn(async () => []),
    ...overrides,
  };
}

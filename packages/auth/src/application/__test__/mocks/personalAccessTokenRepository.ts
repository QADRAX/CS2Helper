import { vi } from "vitest";
import type { PersonalAccessTokenRepositoryPort } from "../../ports";

export function createPersonalAccessTokenRepositoryFake(
  overrides: Partial<PersonalAccessTokenRepositoryPort> = {}
): PersonalAccessTokenRepositoryPort {
  return {
    insertToken: vi.fn(async () => ({
      id: "pat-1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    })),
    listActiveForUser: vi.fn(async () => []),
    findActiveByTokenHash: vi.fn(async () => null),
    recordLastUsed: vi.fn(async () => {}),
    revokeForUser: vi.fn(async () => false),
    ...overrides,
  };
}

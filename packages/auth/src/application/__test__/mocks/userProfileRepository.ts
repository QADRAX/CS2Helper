import { vi } from "vitest";
import type { UserProfileRepositoryPort } from "../../ports";

export function createUserProfileRepositoryFake(
  overrides: Partial<UserProfileRepositoryPort> = {}
): UserProfileRepositoryPort {
  const now = new Date("2026-01-01T00:00:00.000Z");
  return {
    createEmptyProfile: vi.fn(async () => {}),
    findByUserId: vi.fn(async () => ({
      userId: "u1",
      displayName: null,
      avatarUrl: null,
      updatedAt: now,
    })),
    updateProfile: vi.fn(async (userId, patch) => ({
      userId,
      displayName: patch.displayName ?? null,
      avatarUrl: patch.avatarUrl ?? null,
      updatedAt: now,
    })),
    ...overrides,
  };
}

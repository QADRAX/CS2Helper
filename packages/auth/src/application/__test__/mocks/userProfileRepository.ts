import { vi } from "vitest";
import type { UserProfileRepositoryPort } from "../../ports";

export function createUserProfileRepositoryFake(
  overrides: Partial<UserProfileRepositoryPort> = {}
): UserProfileRepositoryPort {
  return {
    createEmptyProfile: vi.fn(async () => {}),
    findByUserId: vi.fn(async () => null),
    updateProfile: vi.fn(async () => {
      throw new Error("updateProfile not stubbed");
    }),
    ...overrides,
  };
}

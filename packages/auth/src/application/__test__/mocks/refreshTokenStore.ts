import { vi } from "vitest";
import type { RefreshTokenStorePort } from "../../ports";

export function createRefreshTokenStoreFake(
  overrides: Partial<RefreshTokenStorePort> = {}
): RefreshTokenStorePort {
  return {
    saveForUser: vi.fn(async () => {}),
    rotate: vi.fn(async () => null),
    revokeByPlainToken: vi.fn(async () => {}),
    ...overrides,
  };
}

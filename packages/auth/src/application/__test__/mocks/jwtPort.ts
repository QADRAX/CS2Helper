import { vi } from "vitest";
import type { JwtPort } from "../../ports";

export function createJwtPortFake(overrides: Partial<JwtPort> = {}): JwtPort {
  return {
    signAccess: vi.fn(async () => ({
      token: "access-token",
      expiresAt: new Date("2026-01-02T00:00:00.000Z"),
    })),
    verifyAccess: vi.fn(async () => ({
      sub: "u1",
      steamId: "76561198000000001",
      permissions: [],
      roles: [],
      iat: 1,
      exp: 2,
    })),
    buildSyntheticAccessClaims: vi.fn((payload) => ({
      sub: payload.sub,
      steamId: payload.steamId,
      permissions: [...payload.permissions],
      roles: [...payload.roles],
      iat: 10,
      exp: 20,
    })),
    ...overrides,
  };
}

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
      email: "a@b.com",
      permissions: [],
      roles: [],
      iat: 1,
      exp: 2,
    })),
    ...overrides,
  };
}

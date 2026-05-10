import { describe, expect, it, vi } from "vitest";
import type {
  ClockPort,
  JwtPort,
  PersonalAccessTokenRepositoryPort,
  RbacRepositoryPort,
  UserRepositoryPort,
} from "../ports";
import {
  PERSONAL_ACCESS_TOKEN_PREFIX,
  encodeOpaqueRefreshToken,
  refreshTokenStorageHash,
} from "../../domain";
import { verifyPersonalAccessToken } from "../useCases/verifyPersonalAccessToken";
import {
  createClockFake,
  createJwtPortFake,
  createPersonalAccessTokenRepositoryFake,
  createRbacRepositoryFake,
  createUserRepositoryFake,
} from "./mocks";

describe("verifyPersonalAccessToken", () => {
  it("rejects without PAT prefix", async () => {
    const ports: [
      PersonalAccessTokenRepositoryPort,
      UserRepositoryPort,
      RbacRepositoryPort,
      JwtPort,
      ClockPort,
    ] = [
      createPersonalAccessTokenRepositoryFake(),
      createUserRepositoryFake(),
      createRbacRepositoryFake(),
      createJwtPortFake(),
      createClockFake(),
    ];
    await expect(verifyPersonalAccessToken(ports, "eyJhbGciOi")).rejects.toMatchObject({
      code: "INVALID_TOKEN",
    });
  });

  it("resolves user, records last used, and returns synthetic claims", async () => {
    const now = new Date("2026-06-01T12:00:00.000Z");
    const plain = `${PERSONAL_ACCESS_TOKEN_PREFIX}${encodeOpaqueRefreshToken(new Uint8Array(32).fill(1))}`;
    const hash = refreshTokenStorageHash(plain);
    const pat = createPersonalAccessTokenRepositoryFake({
      findActiveByTokenHash: vi.fn(async (h) =>
        h === hash
          ? { id: "pat-row", userId: "u99", expiresAt: new Date(now.getTime() + 60_000) }
          : null
      ),
    });
    const users = createUserRepositoryFake({
      findById: vi.fn(async (id) =>
        id === "u99"
          ? {
              id: "u99",
              email: "pat@example.com",
              isActive: true,
              createdAt: now,
              updatedAt: now,
            }
          : null
      ),
    });
    const rbac = createRbacRepositoryFake({
      getEffectivePermissionKeysForUser: vi.fn(async () => ["p1"]),
      getRoleNamesForUser: vi.fn(async () => ["member"]),
    });
    const jwt = createJwtPortFake();
    const clock = createClockFake(now);
    const claims = await verifyPersonalAccessToken([pat, users, rbac, jwt, clock], plain);
    expect(pat.recordLastUsed).toHaveBeenCalledWith("pat-row", now);
    expect(jwt.buildSyntheticAccessClaims).toHaveBeenCalledWith({
      sub: "u99",
      email: "pat@example.com",
      permissions: ["p1"],
      roles: ["member"],
    });
    expect(claims.sub).toBe("u99");
    expect(claims.email).toBe("pat@example.com");
  });

  it("rejects expired token by row expiry", async () => {
    const now = new Date("2026-06-01T12:00:00.000Z");
    const plain = `${PERSONAL_ACCESS_TOKEN_PREFIX}x`;
    const pat = createPersonalAccessTokenRepositoryFake({
      findActiveByTokenHash: vi.fn(async () => ({
        id: "r",
        userId: "u1",
        expiresAt: new Date(now.getTime() - 1),
      })),
    });
    await expect(
      verifyPersonalAccessToken(
        [pat, createUserRepositoryFake(), createRbacRepositoryFake(), createJwtPortFake(), createClockFake(now)],
        plain
      )
    ).rejects.toMatchObject({ code: "TOKEN_EXPIRED" });
  });
});

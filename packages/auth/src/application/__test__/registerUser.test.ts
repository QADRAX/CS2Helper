import { describe, expect, it, vi } from "vitest";
import type {
  ClockPort,
  JwtPort,
  PasswordHasherPort,
  RbacRepositoryPort,
  RefreshTokenStorePort,
  SecureRandomPort,
  SessionPolicyPort,
  UserProfileRepositoryPort,
  UserRepositoryPort,
} from "../ports";
import { registerUser } from "../useCases/registerUser";

function createPorts(overrides?: Partial<{
  users: UserRepositoryPort;
  profiles: UserProfileRepositoryPort;
  rbac: RbacRepositoryPort;
  passwordHasher: PasswordHasherPort;
  jwt: JwtPort;
  refresh: RefreshTokenStorePort;
  clock: ClockPort;
  random: SecureRandomPort;
  policy: SessionPolicyPort;
}>) {
  const users: UserRepositoryPort = overrides?.users ?? {
    createUser: vi.fn(async () => ({ id: "u1" })),
    findWithPasswordByEmail: vi.fn(async () => null),
    findById: vi.fn(),
  };
  const profiles: UserProfileRepositoryPort = overrides?.profiles ?? {
    createEmptyProfile: vi.fn(async () => {}),
    findByUserId: vi.fn(),
    updateProfile: vi.fn(),
  };
  const rbac: RbacRepositoryPort = overrides?.rbac ?? {
    getEffectivePermissionKeysForUser: vi.fn(async () => ["users.profile.read"]),
    getRoleNamesForUser: vi.fn(async () => ["member"]),
    assignRoleToUserByRoleName: vi.fn(async () => {}),
    removeRoleFromUserByRoleName: vi.fn(),
    createRole: vi.fn(),
    deleteRoleByName: vi.fn(),
    createPermission: vi.fn(),
    assignPermissionToRoleByNames: vi.fn(),
    revokePermissionFromRoleByNames: vi.fn(),
    listRoles: vi.fn(),
    listPermissions: vi.fn(),
  };
  const passwordHasher: PasswordHasherPort = overrides?.passwordHasher ?? {
    hash: vi.fn(async () => "hashed"),
    verify: vi.fn(),
  };
  const jwt: JwtPort = overrides?.jwt ?? {
    signAccess: vi.fn(async () => ({
      token: "access",
      expiresAt: new Date("2026-01-02T00:00:00.000Z"),
    })),
    verifyAccess: vi.fn(),
  };
  const refresh: RefreshTokenStorePort = overrides?.refresh ?? {
    saveForUser: vi.fn(async () => {}),
    rotate: vi.fn(),
    revokeByPlainToken: vi.fn(),
  };
  const clock: ClockPort = overrides?.clock ?? {
    now: () => new Date("2026-01-01T00:00:00.000Z"),
  };
  const random: SecureRandomPort = overrides?.random ?? {
    randomBytes: () => new Uint8Array(32).fill(7),
  };
  const policy: SessionPolicyPort = overrides?.policy ?? {
    accessTokenTtlSec: 300,
    refreshTokenTtlSec: 60 * 60 * 24 * 14,
    defaultRegistrationRoleName: "member",
  };
  return { users, profiles, rbac, passwordHasher, jwt, refresh, clock, random, policy };
}

describe("registerUser", () => {
  it("creates user, profile, assigns default role, and returns tokens", async () => {
    const { users, profiles, rbac, passwordHasher, jwt, refresh, clock, random, policy } =
      createPorts();
    const result = await registerUser(
      [
        users,
        profiles,
        rbac,
        passwordHasher,
        jwt,
        refresh,
        clock,
        random,
        policy,
      ],
      { email: "a@b.com", password: "longpassword" }
    );
    expect(users.createUser).toHaveBeenCalledWith({
      email: "a@b.com",
      passwordHash: "hashed",
    });
    expect(profiles.createEmptyProfile).toHaveBeenCalledWith("u1");
    expect(rbac.assignRoleToUserByRoleName).toHaveBeenCalledWith("u1", "member");
    expect(refresh.saveForUser).toHaveBeenCalled();
    expect(jwt.signAccess).toHaveBeenCalled();
    expect(result.accessToken).toBe("access");
    expect(result.refreshToken.length).toBeGreaterThan(10);
  });

  it("rejects duplicate email", async () => {
    const { users, profiles, rbac, passwordHasher, jwt, refresh, clock, random, policy } =
      createPorts({
        users: {
          createUser: vi.fn(),
          findWithPasswordByEmail: vi.fn(async () => ({
            id: "x",
            email: "a@b.com",
            passwordHash: "h",
            isActive: true,
          })),
          findById: vi.fn(),
        },
      });
    await expect(
      registerUser(
        [
          users,
          profiles,
          rbac,
          passwordHasher,
          jwt,
          refresh,
          clock,
          random,
          policy,
        ],
        { email: "a@b.com", password: "longpassword" }
      )
    ).rejects.toMatchObject({ code: "EMAIL_TAKEN" });
  });
});

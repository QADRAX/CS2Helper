import { describe, expect, it, vi } from "vitest";
import type {
  ClockPort,
  InvitationRepositoryPort,
  JwtPort,
  RbacRepositoryPort,
  RefreshTokenStorePort,
  SecureRandomPort,
  SessionPolicyPort,
  SteamOpenIdVerifierPort,
  UserProfileRepositoryPort,
  UserRepositoryPort,
} from "../ports";
import { completeSteamOpenIdSignIn } from "../useCases/completeSteamOpenIdSignIn";
import { createClockFake } from "./mocks/clock";
import { createInvitationRepositoryFake } from "./mocks/invitationRepository";
import { createJwtPortFake } from "./mocks/jwtPort";
import { createRbacRepositoryFake } from "./mocks/rbacRepository";
import { createRefreshTokenStoreFake } from "./mocks/refreshTokenStore";
import { createSecureRandomFake } from "./mocks/secureRandom";
import { createSessionPolicyFake } from "./mocks/sessionPolicy";
import { createUserProfileRepositoryFake } from "./mocks/userProfileRepository";
import { createUserRepositoryFake } from "./mocks/userRepository";

function createSteamVerifierFake(
  result:
    | { valid: true; steamId64: string; accountName: string | null; avatarUrl: string | null }
    | { valid: false; reason?: string }
): SteamOpenIdVerifierPort {
  return {
    verifyOpenIdAssertion: vi.fn(async () => result),
  };
}

function basePorts(overrides: {
  steam?: SteamOpenIdVerifierPort;
  users?: ReturnType<typeof createUserRepositoryFake>;
  rbac?: ReturnType<typeof createRbacRepositoryFake>;
  invitations?: ReturnType<typeof createInvitationRepositoryFake>;
} = {}): [
  SteamOpenIdVerifierPort,
  UserRepositoryPort,
  UserProfileRepositoryPort,
  RbacRepositoryPort,
  JwtPort,
  RefreshTokenStorePort,
  ClockPort,
  SecureRandomPort,
  SessionPolicyPort,
  InvitationRepositoryPort,
] {
  const users = overrides.users ?? createUserRepositoryFake();
  const profiles = createUserProfileRepositoryFake();
  const rbac =
    overrides.rbac ??
    createRbacRepositoryFake({
      existsUserWithRole: vi.fn(async (name: string) => name !== "admin"),
    });
  const jwt = createJwtPortFake();
  const refresh = createRefreshTokenStoreFake();
  const clock = createClockFake();
  const random = createSecureRandomFake();
  const policy = createSessionPolicyFake();
  const invitations = overrides.invitations ?? createInvitationRepositoryFake();
  const steam =
    overrides.steam ??
    createSteamVerifierFake({
      valid: true,
      steamId64: "76561198000000001",
      accountName: "Carlos",
      avatarUrl: "https://cdn.example/avatar.jpg",
    });
  return [
    steam,
    users,
    profiles,
    rbac,
    jwt,
    refresh,
    clock,
    random,
    policy,
    invitations,
  ];
}

describe("completeSteamOpenIdSignIn", () => {
  it("issues session when Steam user already exists", async () => {
    const users = createUserRepositoryFake({
      findBySteamId: vi.fn(async () => ({
        id: "u1",
        steamId: "76561198000000001",
        isActive: true,
      })),
    });
    const ports = basePorts({ users });
    const result = await completeSteamOpenIdSignIn(ports, {
      openIdParams: { "openid.return_to": "http://localhost/cb", "openid.mode": "id_res" },
      expectedReturnTo: "http://localhost/cb",
    });
    expect(result.accessToken).toBe("access-token");
  });

  it("creates admin when no admin and bootstrap SteamID matches", async () => {
    const users = createUserRepositoryFake({
      findBySteamId: vi.fn(async () => null),
      createUser: vi.fn(async () => ({ id: "new1" })),
    });
    const rbac = createRbacRepositoryFake({
      existsUserWithRole: vi.fn(async () => false),
    });
    const ports = basePorts({ users, rbac });
    const profiles = ports[2] as UserProfileRepositoryPort;
    await completeSteamOpenIdSignIn(ports, {
      openIdParams: { "openid.return_to": "http://localhost/cb", "openid.mode": "id_res" },
      expectedReturnTo: "http://localhost/cb",
      bootstrapRootSteamId: "76561198000000001",
    });
    expect(users.createUser).toHaveBeenCalledWith({ steamId: "76561198000000001" });
    expect(profiles.createEmptyProfile).toHaveBeenCalledWith("new1");
    expect(profiles.updateProfile).toHaveBeenCalledWith("new1", {
      displayName: "Carlos",
      avatarUrl: "https://cdn.example/avatar.jpg",
    });
    expect(rbac.assignRoleToUserByRoleName).toHaveBeenCalledWith("new1", "admin");
  });

  it("requires invitation for new user when admin exists", async () => {
    const users = createUserRepositoryFake({
      findBySteamId: vi.fn(async () => null),
    });
    const rbac = createRbacRepositoryFake({
      existsUserWithRole: vi.fn(async () => true),
    });
    const ports = basePorts({ users, rbac });
    await expect(
      completeSteamOpenIdSignIn(ports, {
        openIdParams: { "openid.return_to": "http://localhost/cb", "openid.mode": "id_res" },
        expectedReturnTo: "http://localhost/cb",
      })
    ).rejects.toMatchObject({ code: "INVITATION_REQUIRED" });
  });

  it("rejects return_to mismatch", async () => {
    const ports = basePorts();
    await expect(
      completeSteamOpenIdSignIn(ports, {
        openIdParams: { "openid.return_to": "http://evil/cb" },
        expectedReturnTo: "http://localhost/cb",
      })
    ).rejects.toMatchObject({ code: "STEAM_OPENID_INVALID" });
  });
});

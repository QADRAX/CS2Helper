import type { AsyncUseCase } from "@cs2helper/shared";
import type { AuthTokens } from "../../domain";
import { AuthDomainError } from "../../domain";
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
import { issueSessionForUser } from "./issueSessionForUser";

export type CompleteSteamOpenIdInput = {
  /** Query string parameters from the OpenID callback (string values only). */
  readonly openIdParams: Readonly<Record<string, string>>;
  /** Must match `openid.return_to` from the callback exactly. */
  readonly expectedReturnTo: string;
  /**
   * Plain invitation code from the host-controlled login start (cookie).
   * Required for new users except the configured bootstrap SteamID when no admin exists.
   */
  readonly invitationPlainCode?: string | undefined;
  /** When set, first admin is created for this SteamID64 if no admin exists yet. */
  readonly bootstrapRootSteamId?: string | undefined;
};

/**
 * Ports tuple order:
 * `[steamOpenId, users, profiles, rbac, jwt, refreshTokens, clock, random, sessionPolicy, invitations]`.
 */
export const completeSteamOpenIdSignIn: AsyncUseCase<
  [
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
  ],
  [input: CompleteSteamOpenIdInput],
  AuthTokens
> = async (
  [
    steamOpenId,
    users,
    profiles,
    rbac,
    jwt,
    refreshTokens,
    clock,
    random,
    sessionPolicy,
    invitations,
  ],
  input
) => {
  const returnTo = input.openIdParams["openid.return_to"] ?? "";
  if (returnTo !== input.expectedReturnTo) {
    throw new AuthDomainError("STEAM_OPENID_INVALID", "OpenID return_to mismatch");
  }

  const verified = await steamOpenId.verifyOpenIdAssertion(input.openIdParams);
  if (!verified.valid) {
    throw new AuthDomainError(
      "STEAM_OPENID_INVALID",
      verified.reason ?? "Steam OpenID verification failed"
    );
  }
  const steamId64 = verified.steamId64;

  const existing = await users.findBySteamId(steamId64);
  if (existing) {
    if (!existing.isActive) {
      throw new AuthDomainError("USER_INACTIVE", "User is inactive");
    }
    // Refresh avatar/displayName on every Steam login.
    // (Steam OpenID assertion does not include avatar/name, so we fetch the public profile each time.)
    const displayName = verified.accountName?.trim() || null;
    const avatarUrl = verified.avatarUrl?.trim() || null;
    if (displayName !== null || avatarUrl !== null) {
      await profiles.updateProfile(existing.id, { displayName, avatarUrl });
    }
    return issueSessionForUser(
      [jwt, refreshTokens, clock, random, rbac, sessionPolicy],
      { userId: existing.id, steamId: existing.steamId }
    );
  }

  const noAdmin = !(await rbac.existsUserWithRole("admin"));
  const bootstrap = input.bootstrapRootSteamId?.trim() ?? "";
  const displayName = verified.accountName?.trim() || null;
  const avatarUrl = verified.avatarUrl?.trim() || null;
  if (noAdmin && bootstrap.length > 0 && bootstrap === steamId64) {
    const { id: userId } = await users.createUser({ steamId: steamId64 });
    await profiles.createEmptyProfile(userId);
    await profiles.updateProfile(userId, { displayName, avatarUrl });
    await rbac.assignRoleToUserByRoleName(userId, "admin");
    return issueSessionForUser(
      [jwt, refreshTokens, clock, random, rbac, sessionPolicy],
      { userId, steamId: steamId64 }
    );
  }

  const code = input.invitationPlainCode?.trim() ?? "";
  if (code.length === 0) {
    throw new AuthDomainError("INVITATION_REQUIRED", "Invitation code is required");
  }

  let claimed: { id: string; extraRoleName: string | null } | null = null;
  try {
    claimed = await invitations.claimOneUseIfValid(code);
    if (!claimed) {
      throw new AuthDomainError("INVITATION_INVALID", "Invalid or expired invitation code");
    }

    const { id: userId } = await users.createUser({ steamId: steamId64 });
    await profiles.createEmptyProfile(userId);
    await profiles.updateProfile(userId, { displayName, avatarUrl });
    await rbac.assignRoleToUserByRoleName(userId, sessionPolicy.defaultRegistrationRoleName);
    if (claimed.extraRoleName) {
      await rbac.assignRoleToUserByRoleName(userId, claimed.extraRoleName);
    }

    return issueSessionForUser(
      [jwt, refreshTokens, clock, random, rbac, sessionPolicy],
      { userId, steamId: steamId64 }
    );
  } catch (err) {
    if (claimed) {
      await invitations.releaseClaimedUse(claimed.id);
    }
    throw err;
  }
};

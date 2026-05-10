import type { AsyncUseCase } from "@cs2helper/shared";
import type { AuthTokens, RegisterUserInput } from "../../domain";
import { AuthDomainError } from "../../domain";
import { validateEmail } from "../../domain";
import { validatePassword } from "../../domain";
import type {
  ClockPort,
  InvitationRepositoryPort,
  JwtPort,
  PasswordHasherPort,
  RbacRepositoryPort,
  RefreshTokenStorePort,
  SecureRandomPort,
  SessionPolicyPort,
  UserProfileRepositoryPort,
  UserRepositoryPort,
} from "../ports";
import { issueSessionForUser } from "./issueSessionForUser";

/**
 * Ports tuple order:
 * `[users, profiles, rbac, passwordHasher, jwt, refreshTokens, clock, random, sessionPolicy, invitations]`.
 */
export const registerUser: AsyncUseCase<
  [
    UserRepositoryPort,
    UserProfileRepositoryPort,
    RbacRepositoryPort,
    PasswordHasherPort,
    JwtPort,
    RefreshTokenStorePort,
    ClockPort,
    SecureRandomPort,
    SessionPolicyPort,
    InvitationRepositoryPort,
  ],
  [input: RegisterUserInput],
  AuthTokens
> = async (
  [
    users,
    profiles,
    rbac,
    passwordHasher,
    jwt,
    refreshTokens,
    clock,
    random,
    sessionPolicy,
    invitations,
  ],
  input
) => {
  const email = validateEmail(input.email);
  validatePassword(input.password);

  const code = input.invitationPlainCode?.trim() ?? "";
  const requireInvite = sessionPolicy.requireInvitationForRegister;
  if (requireInvite && code.length === 0) {
    throw new AuthDomainError("INVITATION_REQUIRED", "Invitation code is required");
  }

  let claimed: { id: string; extraRoleName: string | null } | null = null;
  try {
    if (code.length > 0) {
      claimed = await invitations.claimOneUseIfValid(code);
      if (!claimed) {
        throw new AuthDomainError("INVITATION_INVALID", "Invalid or expired invitation code");
      }
    }

    const existing = await users.findWithPasswordByEmail(email);
    if (existing) {
      throw new AuthDomainError("EMAIL_TAKEN", "Email is already registered");
    }

    const passwordHash = await passwordHasher.hash(input.password);
    const { id: userId } = await users.createUser({ email, passwordHash });
    await profiles.createEmptyProfile(userId);
    await rbac.assignRoleToUserByRoleName(userId, sessionPolicy.defaultRegistrationRoleName);
    if (claimed?.extraRoleName) {
      await rbac.assignRoleToUserByRoleName(userId, claimed.extraRoleName);
    }

    return issueSessionForUser(
      [jwt, refreshTokens, clock, random, rbac, sessionPolicy],
      { userId, email }
    );
  } catch (err) {
    if (claimed) {
      await invitations.releaseClaimedUse(claimed.id);
    }
    throw err;
  }
};

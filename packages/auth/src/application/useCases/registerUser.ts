import type { AsyncUseCase } from "@cs2helper/shared";
import type { AuthTokens } from "../../domain";
import { AuthDomainError } from "../../domain";
import { validateEmail } from "../../domain";
import { validatePassword } from "../../domain";
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
import { issueSessionForUser } from "./issueSessionForUser";

export type RegisterUserInput = {
  email: string;
  password: string;
};

/**
 * Ports tuple order:
 * `[users, profiles, rbac, passwordHasher, jwt, refreshTokens, clock, random, sessionPolicy]`.
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
  ],
  input
) => {
  const email = validateEmail(input.email);
  validatePassword(input.password);
  const existing = await users.findWithPasswordByEmail(email);
  if (existing) {
    throw new AuthDomainError("EMAIL_TAKEN", "Email is already registered");
  }
  const passwordHash = await passwordHasher.hash(input.password);
  const { id: userId } = await users.createUser({ email, passwordHash });
  await profiles.createEmptyProfile(userId);
  await rbac.assignRoleToUserByRoleName(userId, sessionPolicy.defaultRegistrationRoleName);
  return issueSessionForUser(
    [jwt, refreshTokens, clock, random, rbac, sessionPolicy],
    { userId, email }
  );
};

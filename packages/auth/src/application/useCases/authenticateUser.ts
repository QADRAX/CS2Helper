import type { AsyncUseCase } from "@cs2helper/shared";
import type { AuthTokens } from "../../domain";
import { AuthDomainError } from "../../domain";
import { validateEmail } from "../../domain";
import type {
  ClockPort,
  JwtPort,
  PasswordHasherPort,
  RbacRepositoryPort,
  RefreshTokenStorePort,
  SecureRandomPort,
  SessionPolicyPort,
  UserRepositoryPort,
} from "../ports";
import { issueSessionForUser } from "./issueSessionForUser";

/**
 * Ports tuple order:
 * `[users, passwordHasher, rbac, jwt, refreshTokens, clock, random, sessionPolicy]`.
 */
export const authenticateUser: AsyncUseCase<
  [
    UserRepositoryPort,
    PasswordHasherPort,
    RbacRepositoryPort,
    JwtPort,
    RefreshTokenStorePort,
    ClockPort,
    SecureRandomPort,
    SessionPolicyPort,
  ],
  [email: string, password: string],
  AuthTokens
> = async (
  [users, passwordHasher, rbac, jwt, refreshTokens, clock, random, sessionPolicy],
  emailRaw,
  password
) => {
  const email = validateEmail(emailRaw);
  const user = await users.findWithPasswordByEmail(email);
  if (!user) {
    throw new AuthDomainError("INVALID_CREDENTIALS", "Invalid email or password");
  }
  if (!user.isActive) {
    throw new AuthDomainError("USER_INACTIVE", "User is inactive");
  }
  const ok = await passwordHasher.verify(password, user.passwordHash);
  if (!ok) {
    throw new AuthDomainError("INVALID_CREDENTIALS", "Invalid email or password");
  }
  return issueSessionForUser(
    [jwt, refreshTokens, clock, random, rbac, sessionPolicy],
    { userId: user.id, email: user.email }
  );
};

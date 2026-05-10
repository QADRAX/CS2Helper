import type { AsyncUseCase } from "@cs2helper/shared";
import type { AccessTokenClaims } from "../../domain";
import { AuthDomainError, isPersonalAccessTokenPlain, refreshTokenStorageHash } from "../../domain";
import type {
  ClockPort,
  JwtPort,
  PersonalAccessTokenRepositoryPort,
  RbacRepositoryPort,
  UserRepositoryPort,
} from "../ports";

/**
 * Resolves a plaintext PAT into the same claim shape as {@link JwtPort.verifyAccess}.
 *
 * Ports tuple order: `[patTokens, users, rbac, jwt, clock]`.
 */
export const verifyPersonalAccessToken: AsyncUseCase<
  [PersonalAccessTokenRepositoryPort, UserRepositoryPort, RbacRepositoryPort, JwtPort, ClockPort],
  [plainToken: string],
  AccessTokenClaims
> = async ([patTokens, users, rbac, jwt, clock], plainToken) => {
  const trimmed = plainToken.trim();
  if (!isPersonalAccessTokenPlain(trimmed)) {
    throw new AuthDomainError("INVALID_TOKEN", "Not a personal access token");
  }
  const hash = refreshTokenStorageHash(trimmed);
  const row = await patTokens.findActiveByTokenHash(hash);
  if (!row) {
    throw new AuthDomainError("INVALID_TOKEN", "Invalid personal access token");
  }
  const now = clock.now();
  if (row.expiresAt != null && row.expiresAt.getTime() <= now.getTime()) {
    throw new AuthDomainError("TOKEN_EXPIRED", "Personal access token expired");
  }
  const user = await users.findById(row.userId);
  if (!user) {
    throw new AuthDomainError("INVALID_TOKEN", "Invalid personal access token");
  }
  if (!user.isActive) {
    throw new AuthDomainError("USER_INACTIVE", "User is inactive");
  }
  await patTokens.recordLastUsed(row.id, now);
  const permissions = await rbac.getEffectivePermissionKeysForUser(user.id);
  const roles = await rbac.getRoleNamesForUser(user.id);
  return jwt.buildSyntheticAccessClaims({
    sub: user.id,
    email: user.email,
    permissions,
    roles,
  });
};

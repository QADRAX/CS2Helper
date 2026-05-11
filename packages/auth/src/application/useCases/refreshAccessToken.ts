import type { AsyncUseCase } from "@cs2helper/shared";
import type { AuthTokens } from "../../domain";
import { AuthDomainError, encodeOpaqueRefreshToken } from "../../domain";
import type {
  ClockPort,
  JwtPort,
  RbacRepositoryPort,
  RefreshTokenStorePort,
  SecureRandomPort,
  SessionPolicyPort,
  UserRepositoryPort,
} from "../ports";

/**
 * Rotates the refresh token and returns new access + refresh tokens.
 *
 * Ports tuple order:
 * `[users, refreshTokens, jwt, clock, random, rbac, sessionPolicy]`.
 */
export const refreshAccessToken: AsyncUseCase<
  [
    UserRepositoryPort,
    RefreshTokenStorePort,
    JwtPort,
    ClockPort,
    SecureRandomPort,
    RbacRepositoryPort,
    SessionPolicyPort,
  ],
  [refreshTokenPlain: string],
  AuthTokens
> = async (
  [users, refreshTokens, jwt, clock, random, rbac, sessionPolicy],
  refreshTokenPlain
) => {
  const now = clock.now();
  const newRefreshPlain = encodeOpaqueRefreshToken(random.randomBytes(32));
  const newRefreshExpiresAt = new Date(now.getTime() + sessionPolicy.refreshTokenTtlSec * 1000);
  const rotated = await refreshTokens.rotate({
    oldTokenPlain: refreshTokenPlain,
    newTokenPlain: newRefreshPlain,
    newExpiresAt: newRefreshExpiresAt,
  });
  if (!rotated) {
    throw new AuthDomainError("REFRESH_TOKEN_INVALID", "Invalid or expired refresh token");
  }
  const user = await users.findById(rotated.userId);
  if (!user) {
    throw new AuthDomainError("USER_NOT_FOUND", "User not found");
  }
  if (!user.isActive) {
    throw new AuthDomainError("USER_INACTIVE", "User is inactive");
  }
  const permissions = await rbac.getEffectivePermissionKeysForUser(user.id);
  const roles = await rbac.getRoleNamesForUser(user.id);
  const { token: accessToken, expiresAt: accessTokenExpiresAt } = await jwt.signAccess({
    sub: user.id,
    steamId: user.steamId,
    permissions,
    roles,
  });
  return {
    accessToken,
    refreshToken: newRefreshPlain,
    accessTokenExpiresAt,
    refreshTokenExpiresAt: newRefreshExpiresAt,
  };
};

import type { AuthTokens } from "../../domain";
import type {
  ClockPort,
  JwtPort,
  RbacRepositoryPort,
  RefreshTokenStorePort,
  SecureRandomPort,
  SessionPolicyPort,
} from "../ports";

export type SessionIssuePortsTuple = [
  JwtPort,
  RefreshTokenStorePort,
  ClockPort,
  SecureRandomPort,
  RbacRepositoryPort,
  SessionPolicyPort,
];

function encodeOpaqueRefreshToken(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

/**
 * Issues a new access token and refresh token for an existing user.
 *
 * Ports tuple order: `[jwt, refreshTokens, clock, random, rbac, sessionPolicy]`.
 */
export async function issueSessionForUser(
  ports: SessionIssuePortsTuple,
  params: { userId: string; email: string }
): Promise<AuthTokens> {
  const [jwt, refreshTokens, clock, random, rbac, sessionPolicy] = ports;
  const now = clock.now();
  const permissions = await rbac.getEffectivePermissionKeysForUser(params.userId);
  const roles = await rbac.getRoleNamesForUser(params.userId);
  const { token: accessToken, expiresAt: accessTokenExpiresAt } = await jwt.signAccess({
    sub: params.userId,
    email: params.email,
    permissions,
    roles,
  });
  const refreshPlain = encodeOpaqueRefreshToken(random.randomBytes(32));
  const refreshExpiresAt = new Date(now.getTime() + sessionPolicy.refreshTokenTtlSec * 1000);
  await refreshTokens.saveForUser({
    userId: params.userId,
    tokenPlain: refreshPlain,
    expiresAt: refreshExpiresAt,
  });
  return {
    accessToken,
    refreshToken: refreshPlain,
    accessTokenExpiresAt,
    refreshTokenExpiresAt: refreshExpiresAt,
  };
}

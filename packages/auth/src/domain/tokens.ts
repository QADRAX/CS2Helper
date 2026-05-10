import type { UserId } from "./user";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

export interface AccessTokenClaims {
  sub: UserId;
  email: string;
  permissions: readonly string[];
  roles: readonly string[];
  iat: number;
  exp: number;
  iss?: string;
  aud?: string | string[];
}

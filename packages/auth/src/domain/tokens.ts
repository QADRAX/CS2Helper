import type { UserId } from "./user";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

export interface AccessTokenClaims {
  sub: UserId;
  /** SteamID64 from the `steam_id` JWT claim. */
  steamId: string;
  permissions: readonly string[];
  roles: readonly string[];
  iat: number;
  exp: number;
  iss?: string;
  aud?: string | string[];
}

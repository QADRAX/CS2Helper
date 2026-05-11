import type { AccessTokenClaims } from "../../domain";

export interface JwtPort {
  signAccess(payload: {
    sub: string;
    steamId: string;
    permissions: readonly string[];
    roles: readonly string[];
  }): Promise<{ token: string; expiresAt: Date }>;

  verifyAccess(token: string): Promise<AccessTokenClaims>;

  /**
   * Builds the same claim shape as a verified access JWT (e.g. for personal access tokens)
   * without minting a signed JWT string.
   */
  buildSyntheticAccessClaims(payload: {
    sub: string;
    steamId: string;
    permissions: readonly string[];
    roles: readonly string[];
  }): AccessTokenClaims;
}

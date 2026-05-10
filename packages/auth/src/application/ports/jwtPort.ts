import type { AccessTokenClaims } from "../../domain";

export interface JwtPort {
  signAccess(payload: {
    sub: string;
    email: string;
    permissions: readonly string[];
    roles: readonly string[];
  }): Promise<{ token: string; expiresAt: Date }>;

  verifyAccess(token: string): Promise<AccessTokenClaims>;
}

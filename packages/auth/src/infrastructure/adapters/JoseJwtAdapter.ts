import { SignJWT, jwtVerify } from "jose";
import type { AccessTokenClaims } from "../../domain";
import { AuthDomainError } from "../../domain";
import type { ClockPort, JwtPort } from "../../application/ports";

export type JoseJwtAdapterOptions = {
  secret: string;
  issuer?: string;
  audience?: string;
  accessTokenTtlSec: number;
  clock: ClockPort;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

export class JoseJwtAdapter implements JwtPort {
  private readonly encodedSecret: Uint8Array;
  private readonly issuer?: string;
  private readonly audience?: string;
  private readonly accessTokenTtlSec: number;
  private readonly clock: ClockPort;

  constructor(options: JoseJwtAdapterOptions) {
    this.encodedSecret = new TextEncoder().encode(options.secret);
    this.issuer = options.issuer;
    this.audience = options.audience;
    this.accessTokenTtlSec = options.accessTokenTtlSec;
    this.clock = options.clock;
  }

  async signAccess(payload: {
    sub: string;
    steamId: string;
    permissions: readonly string[];
    roles: readonly string[];
  }): Promise<{ token: string; expiresAt: Date }> {
    const now = this.clock.now();
    const exp = new Date(now.getTime() + this.accessTokenTtlSec * 1000);
    const jwtPayload: Record<string, unknown> = {
      steam_id: payload.steamId,
      permissions: [...payload.permissions],
      roles: [...payload.roles],
    };
    const builder = new SignJWT(jwtPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(payload.sub)
      .setIssuedAt(now)
      .setExpirationTime(exp);
    if (this.issuer) builder.setIssuer(this.issuer);
    if (this.audience) builder.setAudience(this.audience);
    const token = await builder.sign(this.encodedSecret);
    return { token, expiresAt: exp };
  }

  buildSyntheticAccessClaims(payload: {
    sub: string;
    steamId: string;
    permissions: readonly string[];
    roles: readonly string[];
  }): AccessTokenClaims {
    const now = this.clock.now();
    const iat = Math.floor(now.getTime() / 1000);
    const exp = iat + this.accessTokenTtlSec;
    return {
      sub: payload.sub,
      steamId: payload.steamId,
      permissions: payload.permissions,
      roles: payload.roles,
      iat,
      exp,
      iss: this.issuer,
      aud: this.audience,
    };
  }

  async verifyAccess(token: string): Promise<AccessTokenClaims> {
    try {
      const { payload } = await jwtVerify(token, this.encodedSecret, {
        issuer: this.issuer,
        audience: this.audience,
      });
      const sub = payload.sub;
      if (!sub) {
        throw new AuthDomainError("INVALID_TOKEN", "Access token missing subject");
      }
      const steamIdRaw = payload.steam_id;
      if (typeof steamIdRaw !== "string" || steamIdRaw.length === 0) {
        throw new AuthDomainError("INVALID_TOKEN", "Access token missing steam_id");
      }
      if (typeof payload.iat !== "number" || typeof payload.exp !== "number") {
        throw new AuthDomainError("INVALID_TOKEN", "Access token missing timestamps");
      }
      return {
        sub,
        steamId: steamIdRaw,
        permissions: asStringArray(payload.permissions),
        roles: asStringArray(payload.roles),
        iat: payload.iat,
        exp: payload.exp,
        iss: typeof payload.iss === "string" ? payload.iss : undefined,
        aud: payload.aud,
      };
    } catch (err) {
      if (err instanceof AuthDomainError) throw err;
      throw new AuthDomainError("INVALID_TOKEN", "Invalid access token");
    }
  }
}

import { describe, expect, it } from "vitest";
import { expectTypeOf } from "vitest";
import type { AccessTokenClaims, AuthTokens } from "../tokens";

describe("tokens types", () => {
  it("AuthTokens and AccessTokenClaims are structural", () => {
    const at = new Date();
    const rt = new Date();
    const tokens: AuthTokens = {
      accessToken: "a",
      refreshToken: "r",
      accessTokenExpiresAt: at,
      refreshTokenExpiresAt: rt,
    };
    const claims: AccessTokenClaims = {
      sub: "u",
      email: "e@e.com",
      permissions: ["p"],
      roles: ["r"],
      iat: 1,
      exp: 2,
    };
    expect(tokens.accessToken).toBe("a");
    expect(claims.sub).toBe("u");
    expectTypeOf<AccessTokenClaims["permissions"]>().toEqualTypeOf<readonly string[]>();
  });
});

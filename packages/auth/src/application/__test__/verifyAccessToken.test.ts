import { describe, expect, it, vi } from "vitest";
import { createJwtPortFake } from "./mocks";
import { verifyAccessToken } from "../useCases/verifyAccessToken";

describe("verifyAccessToken", () => {
  it("delegates to jwt port", async () => {
    const claims = {
      sub: "u1",
      steamId: "76561198000000001",
      permissions: ["p"] as const,
      roles: ["r"] as const,
      iat: 1,
      exp: 2,
    };
    const jwt = createJwtPortFake({
      verifyAccess: vi.fn(async () => claims),
    });
    await expect(verifyAccessToken([jwt], "tok")).resolves.toEqual(claims);
    expect(jwt.verifyAccess).toHaveBeenCalledWith("tok");
  });
});

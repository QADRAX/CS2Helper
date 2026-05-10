import { describe, expect, it } from "vitest";
import {
  PERSONAL_ACCESS_TOKEN_PREFIX,
  encodeOpaqueRefreshToken,
  refreshTokenStorageHash,
} from "../../domain";
import { createPersonalAccessToken } from "../useCases/createPersonalAccessToken";
import {
  createClockFake,
  createPersonalAccessTokenRepositoryFake,
  createSecureRandomFake,
} from "./mocks";

describe("createPersonalAccessToken", () => {
  it("stores hash and returns plaintext once with prefix", async () => {
    const pat = createPersonalAccessTokenRepositoryFake();
    const random = createSecureRandomFake(new Uint8Array(32).fill(7));
    const clock = createClockFake(new Date("2026-06-01T12:00:00.000Z"));
    const plainToken = `${PERSONAL_ACCESS_TOKEN_PREFIX}${encodeOpaqueRefreshToken(random.randomBytes(32))}`;
    const tokenHash = refreshTokenStorageHash(plainToken);
    const out = await createPersonalAccessToken([pat, random, clock], "user-1", {
      label: "  laptop  ",
    });
    expect(out.plainToken).toBe(plainToken);
    expect(out.plainToken.startsWith(PERSONAL_ACCESS_TOKEN_PREFIX)).toBe(true);
    expect(out.label).toBe("laptop");
    expect(pat.insertToken).toHaveBeenCalledWith({
      userId: "user-1",
      tokenHash,
      tokenPrefix: `${plainToken.slice(0, 16)}…`,
      label: "laptop",
      expiresAt: null,
    });
  });

  it("rejects expiresAt in the past", async () => {
    const now = new Date("2026-06-01T12:00:00.000Z");
    const pat = createPersonalAccessTokenRepositoryFake();
    const random = createSecureRandomFake();
    const clock = createClockFake(now);
    await expect(
      createPersonalAccessToken([pat, random, clock], "u1", {
        expiresAt: new Date(now.getTime() - 1000),
      })
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    expect(pat.insertToken).not.toHaveBeenCalled();
  });
});

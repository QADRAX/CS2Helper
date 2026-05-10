import { describe, expect, it, vi } from "vitest";
import { revokePersonalAccessToken } from "../useCases/revokePersonalAccessToken";
import { createPersonalAccessTokenRepositoryFake } from "./mocks";

describe("revokePersonalAccessToken", () => {
  it("throws when repository reports missing", async () => {
    const pat = createPersonalAccessTokenRepositoryFake({
      revokeForUser: vi.fn(async () => false),
    });
    await expect(revokePersonalAccessToken([pat], "u1", "tid")).rejects.toMatchObject({
      code: "PERSONAL_ACCESS_TOKEN_NOT_FOUND",
    });
  });

  it("succeeds when revoked", async () => {
    const pat = createPersonalAccessTokenRepositoryFake({
      revokeForUser: vi.fn(async () => true),
    });
    await revokePersonalAccessToken([pat], "u1", "tid");
    expect(pat.revokeForUser).toHaveBeenCalledWith("u1", "tid");
  });
});

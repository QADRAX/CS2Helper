import { describe, expect, it, vi } from "vitest";
import { listPersonalAccessTokens } from "../useCases/listPersonalAccessTokens";
import { createPersonalAccessTokenRepositoryFake } from "./mocks";

describe("listPersonalAccessTokens", () => {
  it("delegates to repository", async () => {
    const pat = createPersonalAccessTokenRepositoryFake({
      listActiveForUser: vi.fn(async () => [
        {
          id: "a",
          label: null,
          expiresAt: null,
          createdAt: new Date(),
          lastUsedAt: null,
          tokenPrefix: "cs2h_pat_abcdef…",
        },
      ]),
    });
    const rows = await listPersonalAccessTokens([pat], "u1");
    expect(pat.listActiveForUser).toHaveBeenCalledWith("u1");
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("a");
  });
});

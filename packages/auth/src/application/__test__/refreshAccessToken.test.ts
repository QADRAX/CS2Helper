import { describe, expect, it, vi } from "vitest";
import { createRefreshAccessTokenPorts, createUserRepositoryFake, sampleUser } from "./mocks";
import { refreshAccessToken } from "../useCases/refreshAccessToken";

describe("refreshAccessToken", () => {
  it("throws when rotate returns null", async () => {
    const ports = createRefreshAccessTokenPorts();
    await expect(refreshAccessToken(ports, "bad-refresh")).rejects.toMatchObject({
      code: "REFRESH_TOKEN_INVALID",
    });
  });

  it("throws when user missing", async () => {
    const ports = createRefreshAccessTokenPorts({
      refresh: {
        rotate: vi.fn(async () => ({ userId: "missing" })),
      },
    });
    await expect(refreshAccessToken(ports, "ok-refresh")).rejects.toMatchObject({
      code: "USER_NOT_FOUND",
    });
  });

  it("throws when user inactive", async () => {
    const users = createUserRepositoryFake({
      findById: vi.fn(async () => sampleUser({ id: "u1", isActive: false })),
    });
    const ports = createRefreshAccessTokenPorts({
      users,
      refresh: {
        rotate: vi.fn(async () => ({ userId: "u1" })),
      },
    });
    await expect(refreshAccessToken(ports, "ok-refresh")).rejects.toMatchObject({
      code: "USER_INACTIVE",
    });
  });

  it("returns new tokens when rotation succeeds", async () => {
    const users = createUserRepositoryFake({
      findById: vi.fn(async () => sampleUser({ id: "u1", email: "a@b.com", isActive: true })),
    });
    const ports = createRefreshAccessTokenPorts({
      users,
      refresh: {
        rotate: vi.fn(async () => ({ userId: "u1" })),
      },
    });
    const result = await refreshAccessToken(ports, "old-refresh");
    expect(result.accessToken).toBe("access-token");
    expect(result.refreshToken.length).toBeGreaterThan(0);
  });
});

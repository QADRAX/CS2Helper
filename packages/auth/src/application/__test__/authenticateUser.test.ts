import { describe, expect, it, vi } from "vitest";
import { createAuthenticateUserPorts, createUserRepositoryFake } from "./mocks";
import { authenticateUser } from "../useCases/authenticateUser";

describe("authenticateUser", () => {
  it("throws when user is unknown", async () => {
    const ports = createAuthenticateUserPorts();
    await expect(authenticateUser(ports, "nope@b.com", "longpassword")).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
  });

  it("throws when user is inactive", async () => {
    const users = createUserRepositoryFake({
      findWithPasswordByEmail: vi.fn(async () => ({
        id: "u1",
        email: "a@b.com",
        passwordHash: "h",
        isActive: false,
      })),
    });
    const ports = createAuthenticateUserPorts({ users });
    await expect(authenticateUser(ports, "a@b.com", "longpassword")).rejects.toMatchObject({
      code: "USER_INACTIVE",
    });
  });

  it("throws when password does not verify", async () => {
    const users = createUserRepositoryFake({
      findWithPasswordByEmail: vi.fn(async () => ({
        id: "u1",
        email: "a@b.com",
        passwordHash: "h",
        isActive: true,
      })),
    });
    const ports = createAuthenticateUserPorts({
      users,
      passwordHasher: { verify: vi.fn(async () => false) },
    });
    await expect(authenticateUser(ports, "a@b.com", "wrong")).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
  });

  it("returns tokens when credentials are valid", async () => {
    const users = createUserRepositoryFake({
      findWithPasswordByEmail: vi.fn(async () => ({
        id: "u1",
        email: "a@b.com",
        passwordHash: "h",
        isActive: true,
      })),
    });
    const ports = createAuthenticateUserPorts({ users });
    const result = await authenticateUser(ports, "a@b.com", "longpassword");
    expect(result.accessToken).toBe("access-token");
    expect(result.refreshToken.length).toBeGreaterThan(0);
  });
});

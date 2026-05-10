import { describe, expect, it, vi } from "vitest";
import { createRegisterUserPorts, createUserRepositoryFake } from "./mocks";
import { registerUser } from "../useCases/registerUser";

describe("registerUser", () => {
  it("creates user, profile, assigns default role, and returns tokens", async () => {
    const ports = createRegisterUserPorts();
    const [users, profiles, rbac, , jwt, refresh, clock, random, policy] = ports;
    const result = await registerUser(ports, { email: "a@b.com", password: "longpassword" });
    expect(users.createUser).toHaveBeenCalledWith({
      email: "a@b.com",
      passwordHash: "hashed-password",
    });
    expect(profiles.createEmptyProfile).toHaveBeenCalledWith("u1");
    expect(rbac.assignRoleToUserByRoleName).toHaveBeenCalledWith("u1", "member");
    expect(refresh.saveForUser).toHaveBeenCalled();
    expect(jwt.signAccess).toHaveBeenCalled();
    expect(result.accessToken).toBe("access-token");
    expect(result.refreshToken.length).toBeGreaterThan(10);
    void clock;
    void random;
    void policy;
  });

  it("rejects duplicate email", async () => {
    const users = createUserRepositoryFake({
      createUser: vi.fn(),
      findWithPasswordByEmail: vi.fn(async () => ({
        id: "x",
        email: "a@b.com",
        passwordHash: "h",
        isActive: true,
      })),
      findById: vi.fn(),
    });
    const ports = createRegisterUserPorts({ users });
    await expect(
      registerUser(ports, { email: "a@b.com", password: "longpassword" })
    ).rejects.toMatchObject({ code: "EMAIL_TAKEN" });
  });
});

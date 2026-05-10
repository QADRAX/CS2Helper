import { describe, expect, it, vi } from "vitest";
import { createRegisterUserPorts, createUserRepositoryFake } from "./mocks";
import { registerUser } from "../useCases/registerUser";

describe("registerUser", () => {
  it("creates user, profile, assigns default role, and returns tokens", async () => {
    const ports = createRegisterUserPorts();
    const [users, profiles, rbac, , jwt, refresh, , , , invitations] = ports;
    const result = await registerUser(ports, { email: "a@b.com", password: "longpassword" });
    expect(invitations.claimOneUseIfValid).not.toHaveBeenCalled();
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

  it("requires invitation when policy says so", async () => {
    const ports = createRegisterUserPorts({
      policy: { requireInvitationForRegister: true },
    });
    await expect(
      registerUser(ports, { email: "a@b.com", password: "longpassword" })
    ).rejects.toMatchObject({ code: "INVITATION_REQUIRED" });
  });

  it("rejects invalid invitation code", async () => {
    const ports = createRegisterUserPorts({
      invitations: {
        claimOneUseIfValid: vi.fn(async () => null),
      },
    });
    await expect(
      registerUser(ports, {
        email: "a@b.com",
        password: "longpassword",
        invitationPlainCode: "bad",
      })
    ).rejects.toMatchObject({ code: "INVITATION_INVALID" });
  });

  it("consumes invitation and assigns extra role when code valid", async () => {
    const ports = createRegisterUserPorts({
      invitations: {
        claimOneUseIfValid: vi.fn(async () => ({
          id: "inv-1",
          extraRoleName: "coach",
        })),
      },
    });
    const [, , rbac, , , , , , , invitations] = ports;
    await registerUser(ports, {
      email: "a@b.com",
      password: "longpassword",
      invitationPlainCode: "secret-code",
    });
    expect(invitations.claimOneUseIfValid).toHaveBeenCalledWith("secret-code");
    expect(rbac.assignRoleToUserByRoleName).toHaveBeenCalledWith("u1", "member");
    expect(rbac.assignRoleToUserByRoleName).toHaveBeenCalledWith("u1", "coach");
    expect(invitations.releaseClaimedUse).not.toHaveBeenCalled();
  });

  it("releases claim when signup fails after consume", async () => {
    const users = createUserRepositoryFake({
      createUser: vi.fn(async () => {
        throw new Error("db down");
      }),
      findWithPasswordByEmail: vi.fn(async () => null),
      findById: vi.fn(),
    });
    const ports = createRegisterUserPorts({
      users,
      invitations: {
        claimOneUseIfValid: vi.fn(async () => ({ id: "inv-1", extraRoleName: null })),
      },
    });
    const invitations = ports[9];
    await expect(
      registerUser(ports, {
        email: "a@b.com",
        password: "longpassword",
        invitationPlainCode: "ok",
      })
    ).rejects.toThrow("db down");
    expect(invitations.releaseClaimedUse).toHaveBeenCalledWith("inv-1");
  });
});

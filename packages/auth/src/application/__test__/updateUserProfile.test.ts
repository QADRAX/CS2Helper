import { describe, expect, it, vi } from "vitest";
import {
  createRbacRepositoryFake,
  createUserProfileRepositoryFake,
  sampleUserProfile,
} from "./mocks";
import {
  PROFILE_UPDATE_ANY_PERMISSION,
  updateUserProfile,
} from "../useCases/updateUserProfile";

describe("updateUserProfile", () => {
  it("updates when actor is subject", async () => {
    const existing = sampleUserProfile({ userId: "u1", displayName: "Old" });
    const updated = sampleUserProfile({ userId: "u1", displayName: "New" });
    const profiles = createUserProfileRepositoryFake({
      findByUserId: vi.fn(async () => existing),
      updateProfile: vi.fn(async () => updated),
    });
    const rbac = createRbacRepositoryFake();
    const result = await updateUserProfile([profiles, rbac], "u1", "u1", {
      displayName: "New",
    });
    expect(result.displayName).toBe("New");
    expect(profiles.updateProfile).toHaveBeenCalledWith("u1", { displayName: "New" });
  });

  it("forbids updating another user without update_any", async () => {
    const profiles = createUserProfileRepositoryFake({
      findByUserId: vi.fn(async () => sampleUserProfile({ userId: "u2" })),
    });
    const rbac = createRbacRepositoryFake({
      getEffectivePermissionKeysForUser: vi.fn(async () => []),
    });
    await expect(
      updateUserProfile([profiles, rbac], "u2", "u1", { displayName: "X" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows updating another user with update_any", async () => {
    const updated = sampleUserProfile({ userId: "u2", displayName: "X" });
    const profiles = createUserProfileRepositoryFake({
      findByUserId: vi.fn(async () => sampleUserProfile({ userId: "u2" })),
      updateProfile: vi.fn(async () => updated),
    });
    const rbac = createRbacRepositoryFake({
      getEffectivePermissionKeysForUser: vi.fn(async () => [PROFILE_UPDATE_ANY_PERMISSION]),
    });
    await expect(
      updateUserProfile([profiles, rbac], "u2", "u1", { displayName: "X" })
    ).resolves.toEqual(updated);
  });

  it("throws when profile missing", async () => {
    const profiles = createUserProfileRepositoryFake({
      findByUserId: vi.fn(async () => null),
    });
    const rbac = createRbacRepositoryFake();
    await expect(
      updateUserProfile([profiles, rbac], "u1", "u1", { displayName: "X" })
    ).rejects.toMatchObject({ code: "PROFILE_NOT_FOUND" });
  });
});

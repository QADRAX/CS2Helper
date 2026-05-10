import { describe, expect, it, vi } from "vitest";
import { PROFILE_READ_ANY_PERMISSION, WILDCARD_PERMISSION_KEY } from "../../domain";
import {
  createRbacRepositoryFake,
  createUserProfileRepositoryFake,
  sampleUserProfile,
} from "./mocks";
import { getUserProfile } from "../useCases/getUserProfile";

describe("getUserProfile", () => {
  it("returns profile for self without extra permissions", async () => {
    const profile = sampleUserProfile({ userId: "u1" });
    const profiles = createUserProfileRepositoryFake({
      findByUserId: vi.fn(async () => profile),
    });
    const rbac = createRbacRepositoryFake();
    await expect(getUserProfile([profiles, rbac], "u1", "u1")).resolves.toEqual(profile);
    expect(rbac.getEffectivePermissionKeysForUser).not.toHaveBeenCalled();
  });

  it("forbids reading another user without read_any", async () => {
    const profiles = createUserProfileRepositoryFake({
      findByUserId: vi.fn(async () => sampleUserProfile({ userId: "u2" })),
    });
    const rbac = createRbacRepositoryFake({
      getEffectivePermissionKeysForUser: vi.fn(async () => []),
    });
    await expect(getUserProfile([profiles, rbac], "u2", "u1")).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("allows reading another user with wildcard *", async () => {
    const profile = sampleUserProfile({ userId: "u2" });
    const profiles = createUserProfileRepositoryFake({
      findByUserId: vi.fn(async () => profile),
    });
    const rbac = createRbacRepositoryFake({
      getEffectivePermissionKeysForUser: vi.fn(async () => [WILDCARD_PERMISSION_KEY]),
    });
    await expect(getUserProfile([profiles, rbac], "u2", "u1")).resolves.toEqual(profile);
  });

  it("allows reading another user with read_any", async () => {
    const profile = sampleUserProfile({ userId: "u2" });
    const profiles = createUserProfileRepositoryFake({
      findByUserId: vi.fn(async () => profile),
    });
    const rbac = createRbacRepositoryFake({
      getEffectivePermissionKeysForUser: vi.fn(async () => [PROFILE_READ_ANY_PERMISSION]),
    });
    await expect(getUserProfile([profiles, rbac], "u2", "u1")).resolves.toEqual(profile);
  });

  it("throws when profile missing", async () => {
    const profiles = createUserProfileRepositoryFake({
      findByUserId: vi.fn(async () => null),
    });
    const rbac = createRbacRepositoryFake();
    await expect(getUserProfile([profiles, rbac], "u1", "u1")).rejects.toMatchObject({
      code: "PROFILE_NOT_FOUND",
    });
  });
});

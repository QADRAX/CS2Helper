import { describe, expect, it, vi } from "vitest";
import { WILDCARD_PERMISSION_KEY } from "../../domain";
import { createRbacRepositoryFake } from "./mocks";
import { assertUserHasPermission } from "../useCases/assertUserHasPermission";

describe("assertUserHasPermission", () => {
  it("resolves when permission is present", async () => {
    const rbac = createRbacRepositoryFake({
      getEffectivePermissionKeysForUser: vi.fn(async () => ["a", "b"]),
    });
    await expect(assertUserHasPermission([rbac], "u1", "b")).resolves.toBeUndefined();
  });

  it("resolves when user has only wildcard *", async () => {
    const rbac = createRbacRepositoryFake({
      getEffectivePermissionKeysForUser: vi.fn(async () => [WILDCARD_PERMISSION_KEY]),
    });
    await expect(
      assertUserHasPermission([rbac], "u1", "any.operation")
    ).resolves.toBeUndefined();
  });

  it("throws when permission is missing", async () => {
    const rbac = createRbacRepositoryFake({
      getEffectivePermissionKeysForUser: vi.fn(async () => ["a"]),
    });
    await expect(assertUserHasPermission([rbac], "u1", "b")).rejects.toMatchObject({
      code: "PERMISSION_DENIED",
    });
  });
});

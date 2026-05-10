import { describe, expect, it, vi } from "vitest";
import { createRbacRepositoryFake } from "./mocks";
import { getEffectivePermissions } from "../useCases/getEffectivePermissions";

describe("getEffectivePermissions", () => {
  it("delegates to rbac repository", async () => {
    const rbac = createRbacRepositoryFake({
      getEffectivePermissionKeysForUser: vi.fn(async () => ["x", "y"]),
    });
    await expect(getEffectivePermissions([rbac], "u1")).resolves.toEqual(["x", "y"]);
    expect(rbac.getEffectivePermissionKeysForUser).toHaveBeenCalledWith("u1");
  });
});

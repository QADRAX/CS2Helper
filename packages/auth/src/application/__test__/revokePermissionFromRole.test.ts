import { describe, expect, it, vi } from "vitest";
import { createRbacRepositoryFake } from "./mocks";
import { revokePermissionFromRole } from "../useCases/revokePermissionFromRole";

describe("revokePermissionFromRole", () => {
  it("delegates to rbac repository", async () => {
    const rbac = createRbacRepositoryFake({
      revokePermissionFromRoleByNames: vi.fn(async () => {}),
    });
    await revokePermissionFromRole([rbac], "admin", "auth.rbac.manage");
    expect(rbac.revokePermissionFromRoleByNames).toHaveBeenCalledWith(
      "admin",
      "auth.rbac.manage"
    );
  });
});

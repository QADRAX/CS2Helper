import { describe, expect, it, vi } from "vitest";
import { createRbacRepositoryFake } from "./mocks";
import { assignPermissionToRole } from "../useCases/assignPermissionToRole";

describe("assignPermissionToRole", () => {
  it("delegates to rbac repository", async () => {
    const rbac = createRbacRepositoryFake({
      assignPermissionToRoleByNames: vi.fn(async () => {}),
    });
    await assignPermissionToRole([rbac], "admin", "auth.rbac.manage");
    expect(rbac.assignPermissionToRoleByNames).toHaveBeenCalledWith(
      "admin",
      "auth.rbac.manage"
    );
  });
});

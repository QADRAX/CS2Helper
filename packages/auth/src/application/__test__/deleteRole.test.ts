import { describe, expect, it, vi } from "vitest";
import { createRbacRepositoryFake } from "./mocks";
import { deleteRole } from "../useCases/deleteRole";

describe("deleteRole", () => {
  it("delegates to rbac repository", async () => {
    const rbac = createRbacRepositoryFake({
      deleteRoleByName: vi.fn(async () => {}),
    });
    await deleteRole([rbac], "mods");
    expect(rbac.deleteRoleByName).toHaveBeenCalledWith("mods");
  });
});

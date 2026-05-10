import { describe, expect, it, vi } from "vitest";
import { createRbacRepositoryFake } from "./mocks";
import { createPermission } from "../useCases/createPermission";

describe("createPermission", () => {
  it("delegates to rbac repository", async () => {
    const rbac = createRbacRepositoryFake({
      createPermission: vi.fn(async () => ({ id: "new-perm" })),
    });
    await expect(createPermission([rbac], "team.invite", "Invite")).resolves.toEqual({
      id: "new-perm",
    });
    expect(rbac.createPermission).toHaveBeenCalledWith("team.invite", "Invite");
  });
});

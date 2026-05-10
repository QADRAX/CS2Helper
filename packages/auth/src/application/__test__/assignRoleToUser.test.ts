import { describe, expect, it, vi } from "vitest";
import { createRbacRepositoryFake } from "./mocks";
import { assignRoleToUser } from "../useCases/assignRoleToUser";

describe("assignRoleToUser", () => {
  it("delegates to rbac repository", async () => {
    const rbac = createRbacRepositoryFake({
      assignRoleToUserByRoleName: vi.fn(async () => {}),
    });
    await assignRoleToUser([rbac], "u1", "member");
    expect(rbac.assignRoleToUserByRoleName).toHaveBeenCalledWith("u1", "member");
  });
});

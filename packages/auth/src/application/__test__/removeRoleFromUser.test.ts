import { describe, expect, it, vi } from "vitest";
import { createRbacRepositoryFake } from "./mocks";
import { removeRoleFromUser } from "../useCases/removeRoleFromUser";

describe("removeRoleFromUser", () => {
  it("delegates to rbac repository", async () => {
    const rbac = createRbacRepositoryFake({
      removeRoleFromUserByRoleName: vi.fn(async () => {}),
    });
    await removeRoleFromUser([rbac], "u1", "member");
    expect(rbac.removeRoleFromUserByRoleName).toHaveBeenCalledWith("u1", "member");
  });
});

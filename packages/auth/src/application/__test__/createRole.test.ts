import { describe, expect, it, vi } from "vitest";
import { createRbacRepositoryFake } from "./mocks";
import { createRole } from "../useCases/createRole";

describe("createRole", () => {
  it("delegates to rbac repository", async () => {
    const rbac = createRbacRepositoryFake({
      createRole: vi.fn(async () => ({ id: "new-role" })),
    });
    await expect(createRole([rbac], "mods", "Moderators")).resolves.toEqual({ id: "new-role" });
    expect(rbac.createRole).toHaveBeenCalledWith("mods", "Moderators");
  });
});

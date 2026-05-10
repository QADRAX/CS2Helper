import { describe, expect, it, vi } from "vitest";
import { createRbacRepositoryFake, sampleRole } from "./mocks";
import { listRoles } from "../useCases/listRoles";

describe("listRoles", () => {
  it("delegates to rbac repository", async () => {
    const rows = [sampleRole({ name: "a" }), sampleRole({ name: "b", id: "r2" })];
    const rbac = createRbacRepositoryFake({
      listRoles: vi.fn(async () => rows),
    });
    await expect(listRoles([rbac])).resolves.toEqual(rows);
  });
});

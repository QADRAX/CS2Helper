import { describe, expect, it, vi } from "vitest";
import { createRbacRepositoryFake, samplePermission } from "./mocks";
import { listPermissions } from "../useCases/listPermissions";

describe("listPermissions", () => {
  it("delegates to rbac repository", async () => {
    const rows = [samplePermission({ key: "a" }), samplePermission({ key: "b", id: "p2" })];
    const rbac = createRbacRepositoryFake({
      listPermissions: vi.fn(async () => rows),
    });
    await expect(listPermissions([rbac])).resolves.toEqual(rows);
  });
});

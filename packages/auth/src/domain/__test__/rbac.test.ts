import { describe, expect, it } from "vitest";
import { expectTypeOf } from "vitest";
import type { Permission, Role } from "../rbac";

describe("rbac types", () => {
  it("Role and Permission match contract", () => {
    const r: Role = {
      id: "1",
      name: "admin",
      description: null,
      createdAt: new Date(),
    };
    const p: Permission = {
      id: "2",
      key: "x.y",
      description: "d",
      createdAt: new Date(),
    };
    expect(r.name).toBe("admin");
    expect(p.key).toBe("x.y");
    expectTypeOf<Permission["key"]>().toBeString();
  });
});

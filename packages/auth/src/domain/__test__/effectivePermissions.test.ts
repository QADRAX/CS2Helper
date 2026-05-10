import { describe, expect, it } from "vitest";
import { effectivePermissionKeys } from "../effectivePermissions";

describe("effectivePermissionKeys", () => {
  it("unions permission keys from multiple roles", () => {
    expect(
      effectivePermissionKeys([
        ["a.read", "b.write"],
        ["b.write", "c.read"],
      ])
    ).toEqual(["a.read", "b.write", "c.read"]);
  });

  it("returns empty array when no roles", () => {
    expect(effectivePermissionKeys([])).toEqual([]);
  });
});

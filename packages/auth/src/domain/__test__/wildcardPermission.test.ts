import { describe, expect, it } from "vitest";
import {
  WILDCARD_PERMISSION_KEY,
  effectiveKeysGrantPermission,
} from "../wildcardPermission";

describe("effectiveKeysGrantPermission", () => {
  it("grants any required key when wildcard is present", () => {
    expect(effectiveKeysGrantPermission([WILDCARD_PERMISSION_KEY], "auth.rbac.manage")).toBe(
      true
    );
    expect(effectiveKeysGrantPermission(["a", WILDCARD_PERMISSION_KEY], "z.any")).toBe(true);
  });

  it("grants when required key is listed", () => {
    expect(effectiveKeysGrantPermission(["a", "b"], "b")).toBe(true);
  });

  it("denies when neither wildcard nor key is present", () => {
    expect(effectiveKeysGrantPermission(["a"], "b")).toBe(false);
    expect(effectiveKeysGrantPermission([], "a")).toBe(false);
  });

  it("wildcard key is only special when listed as effective permission", () => {
    expect(effectiveKeysGrantPermission(["team.invite"], WILDCARD_PERMISSION_KEY)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import * as Domain from "../index";

describe("domain index exports", () => {
  it("exports core functions and types entrypoints", () => {
    expect(typeof Domain.validateEmail).toBe("function");
    expect(typeof Domain.validatePassword).toBe("function");
    expect(typeof Domain.effectivePermissionKeys).toBe("function");
    expect(typeof Domain.refreshTokenStorageHash).toBe("function");
    expect(Domain.AuthDomainError).toBeDefined();
  });
});

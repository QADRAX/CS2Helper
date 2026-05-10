import { describe, expect, it } from "vitest";
import * as Domain from "../index";

describe("domain index exports", () => {
  it("exports core functions and types entrypoints", () => {
    expect(typeof Domain.validateEmail).toBe("function");
    expect(typeof Domain.validatePassword).toBe("function");
    expect(typeof Domain.effectivePermissionKeys).toBe("function");
    expect(typeof Domain.refreshTokenStorageHash).toBe("function");
    expect(typeof Domain.effectiveKeysGrantPermission).toBe("function");
    expect(Domain.WILDCARD_PERMISSION_KEY).toBe("*");
    expect(Domain.PROFILE_READ_ANY_PERMISSION).toBe("users.profile.read_any");
    expect(Domain.AUTH_RBAC_MANAGE_PERMISSION).toBe("auth.rbac.manage");
    expect(Domain.AUTH_INVITATIONS_MANAGE_PERMISSION).toBe("users.invitations.manage");
    expect(typeof Domain.encodeOpaqueRefreshToken).toBe("function");
    expect(Domain.AuthDomainError).toBeDefined();
  });
});

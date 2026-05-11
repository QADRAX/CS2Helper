import { describe, expect, it } from "vitest";
import { createSessionIssuePorts } from "./mocks/compositePorts";
import { issueSessionForUser } from "../useCases/issueSessionForUser";

describe("issueSessionForUser", () => {
  it("loads rbac, signs access, persists refresh", async () => {
    const ports = createSessionIssuePorts();
    const [jwt, refresh, , random, rbac] = ports;
    const result = await issueSessionForUser(ports, { userId: "u1", steamId: "76561198000000001" });
    expect(rbac.getEffectivePermissionKeysForUser).toHaveBeenCalledWith("u1");
    expect(rbac.getRoleNamesForUser).toHaveBeenCalledWith("u1");
    expect(jwt.signAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: "u1",
        steamId: "76561198000000001",
      })
    );
    expect(refresh.saveForUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        tokenPlain: expect.any(String),
      })
    );
    expect(result.accessToken).toBe("access-token");
    expect(result.refreshToken).toBeTruthy();
    void random;
  });
});

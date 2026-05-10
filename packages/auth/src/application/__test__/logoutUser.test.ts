import { describe, expect, it } from "vitest";
import { createRefreshTokenStoreFake } from "./mocks";
import { logoutUser } from "../useCases/logoutUser";

describe("logoutUser", () => {
  it("revokes refresh token via store", async () => {
    const refresh = createRefreshTokenStoreFake();
    await logoutUser([refresh], "plain-token");
    expect(refresh.revokeByPlainToken).toHaveBeenCalledWith("plain-token");
  });
});

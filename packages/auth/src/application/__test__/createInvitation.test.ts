import { describe, expect, it, vi } from "vitest";
import { createClockFake, createInvitationRepositoryFake, createSecureRandomFake } from "./mocks";
import { createInvitation } from "../useCases/createInvitation";

describe("createInvitation", () => {
  it("inserts hashed invitation and returns plain code once", async () => {
    const invitations = createInvitationRepositoryFake();
    const random = createSecureRandomFake();
    const clock = createClockFake(new Date("2030-06-01T12:00:00.000Z"));
    const expiresAt = new Date("2030-07-01T12:00:00.000Z");
    const result = await createInvitation(
      [invitations, random, clock],
      "admin-1",
      { expiresAt, maxUses: 3, extraRoleName: "coach" }
    );
    expect(result.plainCode.length).toBeGreaterThan(10);
    expect(result.invitationId).toBe("inv-1");
    expect(invitations.insertInvitation).toHaveBeenCalledWith(
      expect.objectContaining({
        createdByUserId: "admin-1",
        expiresAt,
        maxUses: 3,
        extraRoleName: "coach",
      })
    );
    const call = vi.mocked(invitations.insertInvitation).mock.calls[0][0];
    expect(call.codeHash).not.toBe(result.plainCode);
  });

  it("rejects maxUses below 1", async () => {
    const invitations = createInvitationRepositoryFake();
    const random = createSecureRandomFake();
    const clock = createClockFake();
    await expect(
      createInvitation([invitations, random, clock], "a", {
        expiresAt: new Date("2030-01-01T00:00:00.000Z"),
        maxUses: 0,
      })
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("rejects expiry not after clock", async () => {
    const invitations = createInvitationRepositoryFake();
    const random = createSecureRandomFake();
    const clock = createClockFake(new Date("2030-06-15T00:00:00.000Z"));
    await expect(
      createInvitation([invitations, random, clock], "a", {
        expiresAt: new Date("2030-06-01T00:00:00.000Z"),
        maxUses: 1,
      })
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});

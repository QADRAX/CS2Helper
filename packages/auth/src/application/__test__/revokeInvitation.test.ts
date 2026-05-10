import { describe, expect, it } from "vitest";
import { createInvitationRepositoryFake } from "./mocks";
import { revokeInvitation } from "../useCases/revokeInvitation";

describe("revokeInvitation", () => {
  it("delegates to repository", async () => {
    const invitations = createInvitationRepositoryFake();
    await revokeInvitation([invitations], "inv-9");
    expect(invitations.revokeInvitation).toHaveBeenCalledWith("inv-9");
  });
});

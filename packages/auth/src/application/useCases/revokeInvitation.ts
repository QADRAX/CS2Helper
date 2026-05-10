import type { AsyncUseCase } from "@cs2helper/shared";
import type { InvitationRepositoryPort } from "../ports";

/** Ports tuple order: `[invitations]`. */
export const revokeInvitation: AsyncUseCase<
  [InvitationRepositoryPort],
  [invitationId: string],
  void
> = async ([invitations], invitationId) => {
  await invitations.revokeInvitation(invitationId);
};

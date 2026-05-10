import type { AsyncUseCase } from "@cs2helper/shared";
import type { InvitationListItem } from "../../domain";
import type { InvitationRepositoryPort } from "../ports";

/** Ports tuple order: `[invitations]`. */
export const listInvitations: AsyncUseCase<
  [InvitationRepositoryPort],
  [],
  InvitationListItem[]
> = async ([invitations]) => invitations.listInvitations();

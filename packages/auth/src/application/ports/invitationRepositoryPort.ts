import type { InvitationListItem } from "../../domain";

export type InvitationClaimSnapshot = {
  id: string;
  extraRoleName: string | null;
};

export interface InvitationRepositoryPort {
  insertInvitation(input: {
    codeHash: string;
    createdByUserId: string;
    expiresAt: Date;
    maxUses: number;
    extraRoleName: string | null;
  }): Promise<{ id: string }>;

  /**
   * Atomically increments use count when the code is valid; returns metadata or null.
   */
  claimOneUseIfValid(codePlain: string): Promise<InvitationClaimSnapshot | null>;

  /**
   * Rolls back a claim when registration fails after {@link claimOneUseIfValid}.
   */
  releaseClaimedUse(invitationId: string): Promise<void>;

  revokeInvitation(invitationId: string): Promise<void>;

  /** All invitations, newest first (no plaintext code). */
  listInvitations(): Promise<InvitationListItem[]>;
}

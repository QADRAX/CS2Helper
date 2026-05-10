/** Invitation row exposed to admins (never includes plaintext code or hash). */
export type InvitationListItem = {
  id: string;
  createdByUserId: string;
  expiresAt: Date;
  maxUses: number;
  usesCount: number;
  extraRoleName: string | null;
  revokedAt: Date | null;
  createdAt: Date;
};

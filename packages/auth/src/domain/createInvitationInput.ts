/**
 * Business args for creating an invitation (expiry and use limits).
 * The host computes `expiresAt` (e.g. now + ttl).
 */
export type CreateInvitationInput = {
  expiresAt: Date;
  maxUses: number;
  extraRoleName?: string | null;
};

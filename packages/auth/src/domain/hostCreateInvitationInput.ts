/** Host-facing args; the service derives `expiresAt` from TTL + clock. */
export type HostCreateInvitationInput = {
  ttlSec: number;
  maxUses: number;
  extraRoleName?: string | null;
};

import type { AsyncUseCase } from "@cs2helper/shared";
import type { CreateInvitationInput } from "../../domain";
import { AuthDomainError } from "../../domain";
import { encodeOpaqueRefreshToken } from "../../domain";
import { refreshTokenStorageHash } from "../../domain";
import type { ClockPort, InvitationRepositoryPort, SecureRandomPort } from "../ports";

/**
 * Persists a hashed invitation and returns the plaintext code once (for the admin to share).
 *
 * Ports tuple order: `[invitations, random, clock]`.
 */
export const createInvitation: AsyncUseCase<
  [InvitationRepositoryPort, SecureRandomPort, ClockPort],
  [createdByUserId: string, input: CreateInvitationInput],
  { plainCode: string; invitationId: string; expiresAt: Date }
> = async ([invitations, random, clock], createdByUserId, input) => {
  if (input.maxUses < 1) {
    throw new AuthDomainError("VALIDATION_ERROR", "maxUses must be at least 1");
  }
  if (input.expiresAt.getTime() <= clock.now().getTime()) {
    throw new AuthDomainError("VALIDATION_ERROR", "expiresAt must be in the future");
  }
  const plainCode = encodeOpaqueRefreshToken(random.randomBytes(24));
  const codeHash = refreshTokenStorageHash(plainCode);
  const { id } = await invitations.insertInvitation({
    codeHash,
    createdByUserId,
    expiresAt: input.expiresAt,
    maxUses: input.maxUses,
    extraRoleName: input.extraRoleName ?? null,
  });
  return { plainCode, invitationId: id, expiresAt: input.expiresAt };
};

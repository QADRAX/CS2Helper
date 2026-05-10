import type { AsyncUseCase } from "@cs2helper/shared";
import type { CreatePersonalAccessTokenInput, PersonalAccessTokenCreated } from "../../domain";
import {
  AuthDomainError,
  PERSONAL_ACCESS_TOKEN_PREFIX,
  encodeOpaqueRefreshToken,
  refreshTokenStorageHash,
} from "../../domain";
import type { ClockPort, PersonalAccessTokenRepositoryPort, SecureRandomPort } from "../ports";

const MAX_LABEL_LENGTH = 200;

function normalizeLabel(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const t = raw.trim();
  if (!t) return null;
  if (t.length > MAX_LABEL_LENGTH) {
    throw new AuthDomainError("VALIDATION_ERROR", `label must be at most ${MAX_LABEL_LENGTH} characters`);
  }
  return t;
}

/**
 * Creates a PAT; the plaintext value is returned once for the user to store (e.g. CLI config).
 *
 * Ports tuple order: `[patTokens, random, clock]`.
 */
export const createPersonalAccessToken: AsyncUseCase<
  [PersonalAccessTokenRepositoryPort, SecureRandomPort, ClockPort],
  [userId: string, input: CreatePersonalAccessTokenInput],
  PersonalAccessTokenCreated
> = async ([patTokens, random, clock], userId, input) => {
  const label = normalizeLabel(input.label);
  const now = clock.now();
  if (input.expiresAt != null && input.expiresAt.getTime() <= now.getTime()) {
    throw new AuthDomainError("VALIDATION_ERROR", "expiresAt must be in the future");
  }
  const plainToken = `${PERSONAL_ACCESS_TOKEN_PREFIX}${encodeOpaqueRefreshToken(random.randomBytes(32))}`;
  const tokenHash = refreshTokenStorageHash(plainToken);
  const tokenPrefix =
    plainToken.length <= 16 ? plainToken : `${plainToken.slice(0, 16)}…`;
  const expiresAt = input.expiresAt ?? null;
  const row = await patTokens.insertToken({
    userId,
    tokenHash,
    tokenPrefix,
    label,
    expiresAt,
  });
  return {
    id: row.id,
    plainToken,
    label,
    expiresAt,
    createdAt: row.createdAt,
    tokenPrefix,
  };
};

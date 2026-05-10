import type { PersonalAccessTokenSummary } from "../../domain";

export interface PersonalAccessTokenRepositoryPort {
  insertToken(params: {
    userId: string;
    tokenHash: string;
    tokenPrefix: string;
    label: string | null;
    expiresAt: Date | null;
  }): Promise<{ id: string; createdAt: Date }>;

  listActiveForUser(userId: string): Promise<PersonalAccessTokenSummary[]>;

  findActiveByTokenHash(tokenHash: string): Promise<{
    id: string;
    userId: string;
    expiresAt: Date | null;
  } | null>;

  recordLastUsed(tokenId: string, at: Date): Promise<void>;

  /** Revokes the token if it exists, belongs to the user, and is not already revoked. */
  revokeForUser(userId: string, tokenId: string): Promise<boolean>;
}

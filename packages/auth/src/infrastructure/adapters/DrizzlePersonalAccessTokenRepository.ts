import { and, desc, eq, gt, isNull, or } from "drizzle-orm";
import type { ClockPort, PersonalAccessTokenRepositoryPort } from "../../application/ports";
import type { PersonalAccessTokenSummary } from "../../domain";
import type { AuthDb } from "../db/createAuthDb";
import { personalAccessTokens } from "../db/schema";

export class DrizzlePersonalAccessTokenRepository implements PersonalAccessTokenRepositoryPort {
  constructor(
    private readonly db: AuthDb,
    private readonly clock: ClockPort
  ) {}

  async insertToken(params: {
    userId: string;
    tokenHash: string;
    tokenPrefix: string;
    label: string | null;
    expiresAt: Date | null;
  }): Promise<{ id: string; createdAt: Date }> {
    const [row] = await this.db
      .insert(personalAccessTokens)
      .values({
        userId: params.userId,
        tokenHash: params.tokenHash,
        tokenPrefix: params.tokenPrefix,
        label: params.label,
        expiresAt: params.expiresAt,
      })
      .returning({ id: personalAccessTokens.id, createdAt: personalAccessTokens.createdAt });
    if (!row) {
      throw new Error("Failed to insert personal access token");
    }
    return row;
  }

  async listActiveForUser(userId: string): Promise<PersonalAccessTokenSummary[]> {
    const rows = await this.db
      .select({
        id: personalAccessTokens.id,
        label: personalAccessTokens.label,
        expiresAt: personalAccessTokens.expiresAt,
        createdAt: personalAccessTokens.createdAt,
        lastUsedAt: personalAccessTokens.lastUsedAt,
        tokenPrefix: personalAccessTokens.tokenPrefix,
      })
      .from(personalAccessTokens)
      .where(and(eq(personalAccessTokens.userId, userId), isNull(personalAccessTokens.revokedAt)))
      .orderBy(desc(personalAccessTokens.createdAt));
    return rows.map((r) => ({
      id: r.id,
      label: r.label,
      expiresAt: r.expiresAt,
      createdAt: r.createdAt,
      lastUsedAt: r.lastUsedAt,
      tokenPrefix: r.tokenPrefix,
    }));
  }

  async findActiveByTokenHash(tokenHash: string): Promise<{
    id: string;
    userId: string;
    expiresAt: Date | null;
  } | null> {
    const now = this.clock.now();
    const [row] = await this.db
      .select({
        id: personalAccessTokens.id,
        userId: personalAccessTokens.userId,
        expiresAt: personalAccessTokens.expiresAt,
      })
      .from(personalAccessTokens)
      .where(
        and(
          eq(personalAccessTokens.tokenHash, tokenHash),
          isNull(personalAccessTokens.revokedAt),
          or(isNull(personalAccessTokens.expiresAt), gt(personalAccessTokens.expiresAt, now))
        )
      )
      .limit(1);
    if (!row) return null;
    return {
      id: row.id,
      userId: row.userId,
      expiresAt: row.expiresAt,
    };
  }

  async recordLastUsed(tokenId: string, at: Date): Promise<void> {
    await this.db
      .update(personalAccessTokens)
      .set({ lastUsedAt: at })
      .where(eq(personalAccessTokens.id, tokenId));
  }

  async revokeForUser(userId: string, tokenId: string): Promise<boolean> {
    const now = this.clock.now();
    const updated = await this.db
      .update(personalAccessTokens)
      .set({ revokedAt: now })
      .where(
        and(
          eq(personalAccessTokens.id, tokenId),
          eq(personalAccessTokens.userId, userId),
          isNull(personalAccessTokens.revokedAt)
        )
      )
      .returning({ id: personalAccessTokens.id });
    return updated.length > 0;
  }
}

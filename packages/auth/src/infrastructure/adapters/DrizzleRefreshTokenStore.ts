import { and, eq, isNull, gt } from "drizzle-orm";
import { refreshTokenStorageHash } from "../../domain";
import type { RefreshTokenStorePort } from "../../application/ports";
import type { AuthDb } from "../db/createAuthDb";
import type { ClockPort } from "../../application/ports";
import { refreshTokens } from "../db/schema";

export class DrizzleRefreshTokenStore implements RefreshTokenStorePort {
  constructor(
    private readonly db: AuthDb,
    private readonly clock: ClockPort
  ) {}

  async saveForUser(params: {
    userId: string;
    tokenPlain: string;
    expiresAt: Date;
  }): Promise<void> {
    const tokenHash = refreshTokenStorageHash(params.tokenPlain);
    await this.db.insert(refreshTokens).values({
      userId: params.userId,
      tokenHash,
      expiresAt: params.expiresAt,
    });
  }

  async rotate(params: {
    oldTokenPlain: string;
    newTokenPlain: string;
    newExpiresAt: Date;
  }): Promise<{ userId: string } | null> {
    const oldHash = refreshTokenStorageHash(params.oldTokenPlain);
    const newHash = refreshTokenStorageHash(params.newTokenPlain);
    const now = this.clock.now();
    return await this.db.transaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(refreshTokens)
        .where(
          and(
            eq(refreshTokens.tokenHash, oldHash),
            isNull(refreshTokens.revokedAt),
            gt(refreshTokens.expiresAt, now)
          )
        )
        .limit(1);
      if (!row) {
        return null;
      }
      await tx.delete(refreshTokens).where(eq(refreshTokens.id, row.id));
      await tx.insert(refreshTokens).values({
        userId: row.userId,
        tokenHash: newHash,
        expiresAt: params.newExpiresAt,
      });
      return { userId: row.userId };
    });
  }

  async revokeByPlainToken(tokenPlain: string): Promise<void> {
    const tokenHash = refreshTokenStorageHash(tokenPlain);
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: this.clock.now() })
      .where(and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt)));
  }
}

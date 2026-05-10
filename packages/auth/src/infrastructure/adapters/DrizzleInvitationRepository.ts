import { desc, and, eq, gt, isNull, lt, sql } from "drizzle-orm";
import { refreshTokenStorageHash } from "../../domain";
import type { InvitationListItem } from "../../domain";
import type {
  ClockPort,
  InvitationClaimSnapshot,
  InvitationRepositoryPort,
} from "../../application/ports";
import type { AuthDb } from "../db/createAuthDb";
import { invitations } from "../db/schema";

export class DrizzleInvitationRepository implements InvitationRepositoryPort {
  constructor(
    private readonly db: AuthDb,
    private readonly clock: ClockPort
  ) {}

  async insertInvitation(input: {
    codeHash: string;
    createdByUserId: string;
    expiresAt: Date;
    maxUses: number;
    extraRoleName: string | null;
  }): Promise<{ id: string }> {
    const [row] = await this.db
      .insert(invitations)
      .values({
        codeHash: input.codeHash,
        createdByUserId: input.createdByUserId,
        expiresAt: input.expiresAt,
        maxUses: input.maxUses,
        extraRoleName: input.extraRoleName,
      })
      .returning();
    if (!row) {
      throw new Error("Failed to create invitation");
    }
    return { id: row.id };
  }

  async claimOneUseIfValid(codePlain: string): Promise<InvitationClaimSnapshot | null> {
    const hash = refreshTokenStorageHash(codePlain);
    const now = this.clock.now();
    const [row] = await this.db
      .update(invitations)
      .set({ usesCount: sql`${invitations.usesCount} + 1` })
      .where(
        and(
          eq(invitations.codeHash, hash),
          isNull(invitations.revokedAt),
          gt(invitations.expiresAt, now),
          lt(invitations.usesCount, invitations.maxUses)
        )
      )
      .returning();
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      extraRoleName: row.extraRoleName,
    };
  }

  async releaseClaimedUse(invitationId: string): Promise<void> {
    await this.db
      .update(invitations)
      .set({ usesCount: sql`${invitations.usesCount} - 1` })
      .where(
        and(eq(invitations.id, invitationId), sql`${invitations.usesCount} > 0`)
      );
  }

  async revokeInvitation(invitationId: string): Promise<void> {
    await this.db
      .update(invitations)
      .set({ revokedAt: this.clock.now() })
      .where(and(eq(invitations.id, invitationId), isNull(invitations.revokedAt)));
  }

  async listInvitations(): Promise<InvitationListItem[]> {
    const rows = await this.db
      .select({
        id: invitations.id,
        createdByUserId: invitations.createdByUserId,
        expiresAt: invitations.expiresAt,
        maxUses: invitations.maxUses,
        usesCount: invitations.usesCount,
        extraRoleName: invitations.extraRoleName,
        revokedAt: invitations.revokedAt,
        createdAt: invitations.createdAt,
      })
      .from(invitations)
      .orderBy(desc(invitations.createdAt));
    return rows;
  }
}

import { eq } from "drizzle-orm";
import type { UserProfile, UserProfileUpdate } from "../../domain";
import { AuthDomainError } from "../../domain";
import { normalizeSteamProfileTextField } from "../../domain/xmlCdata";
import type { UserProfileRepositoryPort } from "../../application/ports";
import type { AuthDb } from "../db/createAuthDb";
import { userProfiles } from "../db/schema";

export class DrizzleUserProfileRepository implements UserProfileRepositoryPort {
  constructor(private readonly db: AuthDb) {}

  async createEmptyProfile(userId: string): Promise<void> {
    await this.db
      .insert(userProfiles)
      .values({ userId })
      .onConflictDoNothing({ target: userProfiles.userId });
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const [row] = await this.db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    if (!row) return null;
    return {
      userId: row.userId,
      displayName: normalizeSteamProfileTextField(row.displayName),
      avatarUrl: normalizeSteamProfileTextField(row.avatarUrl),
      updatedAt: row.updatedAt,
    };
  }

  async updateProfile(userId: string, patch: UserProfileUpdate): Promise<UserProfile> {
    const existing = await this.findByUserId(userId);
    if (!existing) {
      throw new AuthDomainError("PROFILE_NOT_FOUND", "Profile not found");
    }
    const next = {
      displayName: patch.displayName !== undefined ? patch.displayName : existing.displayName,
      avatarUrl: patch.avatarUrl !== undefined ? patch.avatarUrl : existing.avatarUrl,
    };
    await this.db
      .update(userProfiles)
      .set({
        displayName: next.displayName,
        avatarUrl: next.avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId));
    const updated = await this.findByUserId(userId);
    if (!updated) {
      throw new Error("Profile update failed");
    }
    return updated;
  }
}

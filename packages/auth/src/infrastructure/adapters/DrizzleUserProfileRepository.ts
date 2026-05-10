import { eq } from "drizzle-orm";
import type { UserProfile, UserProfileUpdate } from "../../domain";
import { AuthDomainError } from "../../domain";
import type { UserProfileRepositoryPort } from "../../application/ports";
import type { AuthDb } from "../db/createAuthDb";
import { userProfiles } from "../db/schema";

function parseProfileData(raw: string | null): Record<string, unknown> | null {
  if (raw == null || raw === "") return null;
  try {
    const v = JSON.parse(raw) as unknown;
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function serializeProfileData(data: Record<string, unknown> | null | undefined): string | null {
  if (data == null) return null;
  return JSON.stringify(data);
}

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
      displayName: row.displayName,
      avatarUrl: row.avatarUrl,
      bio: row.bio,
      locale: row.locale,
      timezone: row.timezone,
      profileData: parseProfileData(row.profileData),
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
      bio: patch.bio !== undefined ? patch.bio : existing.bio,
      locale: patch.locale !== undefined ? patch.locale : existing.locale,
      timezone: patch.timezone !== undefined ? patch.timezone : existing.timezone,
      profileData:
        patch.profileData !== undefined
          ? serializeProfileData(patch.profileData)
          : serializeProfileData(existing.profileData),
    };
    await this.db
      .update(userProfiles)
      .set({
        displayName: next.displayName,
        avatarUrl: next.avatarUrl,
        bio: next.bio,
        locale: next.locale,
        timezone: next.timezone,
        profileData: next.profileData,
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

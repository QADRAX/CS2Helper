import type { UserId } from "./user";

export interface UserProfile {
  userId: UserId;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  locale: string | null;
  timezone: string | null;
  profileData: Record<string, unknown> | null;
  updatedAt: Date;
}

export type UserProfileUpdate = Partial<
  Pick<
    UserProfile,
    "displayName" | "avatarUrl" | "bio" | "locale" | "timezone" | "profileData"
  >
>;

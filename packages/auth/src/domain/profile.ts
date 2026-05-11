import type { UserId } from "./user";

export interface UserProfile {
  userId: UserId;
  displayName: string | null;
  avatarUrl: string | null;
  updatedAt: Date;
}

export type UserProfileUpdate = Partial<Pick<UserProfile, "displayName" | "avatarUrl">>;

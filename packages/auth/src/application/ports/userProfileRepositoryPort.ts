import type { UserProfile, UserProfileUpdate } from "../../domain";

export interface UserProfileRepositoryPort {
  createEmptyProfile(userId: string): Promise<void>;
  findByUserId(userId: string): Promise<UserProfile | null>;
  updateProfile(userId: string, patch: UserProfileUpdate): Promise<UserProfile>;
}

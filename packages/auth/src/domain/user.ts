export type UserId = string;

export interface User {
  id: UserId;
  /** SteamID64 (digits only). */
  steamId: string;
  displayName: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

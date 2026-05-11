import type { User } from "../../domain";

export interface UserRepositoryPort {
  createUser(input: { steamId: string }): Promise<{ id: string }>;
  /** Lookup by SteamID64 (digits only). */
  findBySteamId(steamId64: string): Promise<{ id: string; steamId: string; isActive: boolean } | null>;
  findById(id: string): Promise<User | null>;
  listUsers(): Promise<User[]>;
}

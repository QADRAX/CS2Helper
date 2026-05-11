import { asc, eq } from "drizzle-orm";
import type { User } from "../../domain";
import { normalizeSteamProfileTextField } from "../../domain/xmlCdata";
import type { UserRepositoryPort } from "../../application/ports";
import type { AuthDb } from "../db/createAuthDb";
import { userProfiles, users } from "../db/schema";

export class DrizzleUserRepository implements UserRepositoryPort {
  constructor(private readonly db: AuthDb) {}

  async createUser(input: { steamId: string }): Promise<{ id: string }> {
    const [row] = await this.db.insert(users).values({ steamId: input.steamId }).returning();
    if (!row) {
      throw new Error("Failed to create user");
    }
    return { id: row.id };
  }

  async findBySteamId(
    steamId64: string
  ): Promise<{ id: string; steamId: string; isActive: boolean } | null> {
    const [row] = await this.db
      .select({
        id: users.id,
        steamId: users.steamId,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.steamId, steamId64))
      .limit(1);
    if (!row) return null;
    return row;
  }

  private mapJoinedRow(row: {
    id: string;
    steamId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    displayName: string | null;
    avatarUrl: string | null;
  }): User {
    return {
      id: row.id,
      steamId: row.steamId,
      displayName: normalizeSteamProfileTextField(row.displayName),
      avatarUrl: normalizeSteamProfileTextField(row.avatarUrl),
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db
      .select({
        id: users.id,
        steamId: users.steamId,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        displayName: userProfiles.displayName,
        avatarUrl: userProfiles.avatarUrl,
      })
      .from(users)
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
      .where(eq(users.id, id))
      .limit(1);
    if (!row) return null;
    return this.mapJoinedRow(row);
  }

  async listUsers(): Promise<User[]> {
    const rows = await this.db
      .select({
        id: users.id,
        steamId: users.steamId,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        displayName: userProfiles.displayName,
        avatarUrl: userProfiles.avatarUrl,
      })
      .from(users)
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
      .orderBy(asc(users.id));
    return rows.map((r) => this.mapJoinedRow(r));
  }
}

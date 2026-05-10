import { asc, eq } from "drizzle-orm";
import type { User } from "../../domain";
import type { UserRepositoryPort, UserWithPassword } from "../../application/ports";
import type { AuthDb } from "../db/createAuthDb";
import { users } from "../db/schema";

export class DrizzleUserRepository implements UserRepositoryPort {
  constructor(private readonly db: AuthDb) {}

  async createUser(input: { email: string; passwordHash: string }): Promise<{ id: string }> {
    const [row] = await this.db
      .insert(users)
      .values({ email: input.email, passwordHash: input.passwordHash })
      .returning();
    if (!row) {
      throw new Error("Failed to create user");
    }
    return { id: row.id };
  }

  async findWithPasswordByEmail(email: string): Promise<UserWithPassword | null> {
    const [row] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      isActive: row.isActive,
    };
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async listUsers(): Promise<User[]> {
    const rows = await this.db.select().from(users).orderBy(asc(users.email));
    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}

import { eq } from "drizzle-orm";
import { DEFAULT_INSTANCE_DISPLAY_NAME } from "../../domain/instanceDisplayName";
import type { InstanceSettingsRepositoryPort } from "../../application/ports/InstanceSettingsRepositoryPort";
import type { CommunityDb } from "../db/createCommunityDb";
import { communityInstanceSettings } from "../db/schema";

export class DrizzleInstanceSettingsRepository implements InstanceSettingsRepositoryPort {
  constructor(private readonly db: CommunityDb) {}

  async getDisplayName(): Promise<string> {
    const [row] = await this.db
      .select({ displayName: communityInstanceSettings.displayName })
      .from(communityInstanceSettings)
      .where(eq(communityInstanceSettings.id, 1))
      .limit(1);
    const v = row?.displayName?.trim();
    return v && v.length > 0 ? v : DEFAULT_INSTANCE_DISPLAY_NAME;
  }

  async setDisplayName(name: string): Promise<void> {
    const now = new Date();
    await this.db
      .insert(communityInstanceSettings)
      .values({
        id: 1,
        displayName: name,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: communityInstanceSettings.id,
        set: {
          displayName: name,
          updatedAt: now,
        },
      });
  }
}

import type { CommunityCoreSdk } from "../domain/communityCoreSdk";
import { getInstanceDisplayName } from "../application/useCases/getInstanceDisplayName";
import { setInstanceDisplayName } from "../application/useCases/setInstanceDisplayName";
import type { CommunityDb } from "./db/createCommunityDb";
import { DrizzleInstanceSettingsRepository } from "./adapters/DrizzleInstanceSettingsRepository";

/**
 * Composition root for community / instance features (no Next.js).
 */
export class CommunityCoreApplication implements CommunityCoreSdk {
  private readonly settings: DrizzleInstanceSettingsRepository;

  constructor(db: CommunityDb) {
    this.settings = new DrizzleInstanceSettingsRepository(db);
  }

  getInstanceDisplayName(): Promise<string> {
    return getInstanceDisplayName([this.settings]);
  }

  setInstanceDisplayName(name: string): Promise<void> {
    return setInstanceDisplayName([this.settings], name);
  }
}

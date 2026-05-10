/**
 * Persistence for the singleton instance settings row (`id = 1`).
 */
export interface InstanceSettingsRepositoryPort {
  getDisplayName(): Promise<string>;
  setDisplayName(name: string): Promise<void>;
}

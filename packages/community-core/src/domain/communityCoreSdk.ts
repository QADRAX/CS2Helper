/**
 * Framework-agnostic surface for community / instance features.
 * Implemented by `CommunityCoreApplication` in infrastructure.
 */
export interface CommunityCoreSdk {
  getInstanceDisplayName(): Promise<string>;
  setInstanceDisplayName(name: string): Promise<void>;
}

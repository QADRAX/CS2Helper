/**
 * Abstract source for the optional Steam Web API key used by the CLI (e.g. env var).
 */
export interface SteamWebApiKeySourcePort {
  /** Non-empty trimmed key, or undefined if unset or blank. */
  readConfiguredKey(): string | undefined;
}

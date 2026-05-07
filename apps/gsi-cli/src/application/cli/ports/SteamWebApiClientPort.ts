export type ValidateSteamApiKeyOutcome = { ok: true } | { ok: false; detail?: string };

/**
 * Validates a Steam Web API key via HTTP against Valve endpoints.
 */
export interface SteamWebApiClientPort {
  validateApiKey(apiKey: string): Promise<ValidateSteamApiKeyOutcome>;
}

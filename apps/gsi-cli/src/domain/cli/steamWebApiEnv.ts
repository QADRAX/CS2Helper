export const CS2HELPER_STEAM_WEB_API_KEY_ENV = "CS2HELPER_STEAM_WEB_API_KEY";

export function readSteamWebApiKeyFromEnv(): string | undefined {
  const raw = process.env[CS2HELPER_STEAM_WEB_API_KEY_ENV];
  const trimmed = raw?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

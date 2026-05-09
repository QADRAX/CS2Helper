import type { SteamWebApiKeySourcePort } from "../../application/ports/SteamWebApiKeySourcePort";
import { readSteamWebApiKeyFromEnv } from "../../domain/cli/steamWebApiEnv";

export class ProcessEnvSteamWebApiKeyAdapter implements SteamWebApiKeySourcePort {
  readConfiguredKey(): string | undefined {
    return readSteamWebApiKeyFromEnv();
  }
}

import type { SteamWebApiKeySourcePort } from "../../../application/cli/ports/SteamWebApiKeySourcePort";
import { readSteamWebApiKeyFromEnv } from "../steamWebApiEnv";

export class ProcessEnvSteamWebApiKeyAdapter implements SteamWebApiKeySourcePort {
  readConfiguredKey(): string | undefined {
    return readSteamWebApiKeyFromEnv();
  }
}

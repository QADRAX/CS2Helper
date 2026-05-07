import type { AsyncUseCase } from "@cs2helper/shared";
import type {
  SteamWebApiClientPort,
  ValidateSteamApiKeyOutcome,
} from "../ports/SteamWebApiClientPort";

export interface VerifySteamWebApiPorts {
  client: SteamWebApiClientPort;
}

/**
 * Probes that the given Steam Web API key is accepted (lightweight listing call).
 */
export const verifySteamWebApi: AsyncUseCase<
  VerifySteamWebApiPorts,
  [apiKey: string],
  ValidateSteamApiKeyOutcome
> = ({ client }, apiKey) => client.validateApiKey(apiKey);

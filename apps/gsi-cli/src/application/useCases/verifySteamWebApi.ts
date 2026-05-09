import type { AsyncUseCase } from "@cs2helper/shared";
import type {
  SteamWebApiClientPort,
  ValidateSteamApiKeyOutcome,
} from "../ports/SteamWebApiClientPort";

/**
 * Probes that the given Steam Web API key is accepted (lightweight listing call).
 *
 * Ports tuple order: `[client]`.
 */
export const verifySteamWebApi: AsyncUseCase<
  [SteamWebApiClientPort],
  [apiKey: string],
  ValidateSteamApiKeyOutcome
> = ([client], apiKey) => client.validateApiKey(apiKey);

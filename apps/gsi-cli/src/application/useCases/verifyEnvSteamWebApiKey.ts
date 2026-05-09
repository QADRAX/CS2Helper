import type { AsyncUseCase } from "@cs2helper/shared";
import type { SteamWebApiKeySourcePort } from "../ports/SteamWebApiKeySourcePort";
import type {
  SteamWebApiClientPort,
  ValidateSteamApiKeyOutcome,
} from "../ports/SteamWebApiClientPort";
import { verifySteamWebApi } from "./verifySteamWebApi";

/**
 * Reads the configured Steam Web API key from the key source; if present, validates it
 * via the HTTP client. If absent, returns `{ ok: false, detail: "missing-key" }`.
 *
 * Ports tuple order: `[keySource, client]`.
 */
export const verifyEnvSteamWebApiKey: AsyncUseCase<
  [SteamWebApiKeySourcePort, SteamWebApiClientPort],
  [],
  ValidateSteamApiKeyOutcome
> = async ([keySource, client]) => {
  const key = keySource.readConfiguredKey();
  if (!key) return { ok: false, detail: "missing-key" };
  return verifySteamWebApi([client], key);
};

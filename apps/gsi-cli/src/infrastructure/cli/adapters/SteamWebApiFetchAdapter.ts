import type { SteamWebApiClientPort, ValidateSteamApiKeyOutcome } from "../../../application/cli/ports/SteamWebApiClientPort";

const VALIDATE_MS = 15_000;
const STEAM_WEB_API_BASE = "https://api.steampowered.com";

interface SteamWrappedResult {
  apilist?: unknown;
  result?: { status?: number; statusDetail?: string };
}

export class SteamWebApiFetchAdapter implements SteamWebApiClientPort {
  async validateApiKey(apiKey: string): Promise<ValidateSteamApiKeyOutcome> {
    try {
      const url = new URL(`${STEAM_WEB_API_BASE}/ISteamWebAPIUtil/GetSupportedAPIList/v0001/`);
      url.searchParams.set("key", apiKey);
      url.searchParams.set("format", "json");

      const signal = AbortSignal.timeout(VALIDATE_MS);
      const response = await fetch(url, {
        signal,
        headers: {
          Accept: "application/json",
        },
      });

      const raw = await response.text();
      let data: SteamWrappedResult;
      try {
        data = JSON.parse(raw) as SteamWrappedResult;
      } catch {
        return response.ok ? { ok: false, detail: "invalid-json" } : { ok: false, detail: `http-${response.status}` };
      }

      if (data?.apilist != null) {
        return { ok: true };
      }

      const statusDetail =
        typeof data.result?.statusDetail === "string" ? data.result.statusDetail : undefined;
      const statusCode =
        typeof data.result?.status === "number" ? String(data.result.status) : undefined;
      const detail = statusDetail ?? statusCode ?? (response.ok ? "rejected" : `http-${response.status}`);

      return { ok: false, detail };
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        (error as Error).name === "TimeoutError"
          ? "timeout"
          : "network";
      return { ok: false, detail: message };
    }
  }
}

import { describe, expect, it, vi } from "vitest";
import { verifyEnvSteamWebApiKey } from "../verifyEnvSteamWebApiKey";
import type { SteamWebApiKeySourcePort } from "../../ports/SteamWebApiKeySourcePort";
import type { SteamWebApiClientPort } from "../../ports/SteamWebApiClientPort";

describe("verifyEnvSteamWebApiKey", () => {
  it("returns missing-key when source has no key", async () => {
    const keySource: SteamWebApiKeySourcePort = {
      readConfiguredKey: () => undefined,
    };
    const client: SteamWebApiClientPort = {
      validateApiKey: vi.fn(),
    };

    const result = await verifyEnvSteamWebApiKey([keySource, client]);

    expect(result).toEqual({ ok: false, detail: "missing-key" });
    expect(client.validateApiKey).not.toHaveBeenCalled();
  });

  it("delegates to client when key is present", async () => {
    const keySource: SteamWebApiKeySourcePort = {
      readConfiguredKey: () => "secret",
    };
    const client: SteamWebApiClientPort = {
      validateApiKey: vi.fn().mockResolvedValue({ ok: true }),
    };

    const result = await verifyEnvSteamWebApiKey([keySource, client]);

    expect(result).toEqual({ ok: true });
    expect(client.validateApiKey).toHaveBeenCalledWith("secret");
  });
});

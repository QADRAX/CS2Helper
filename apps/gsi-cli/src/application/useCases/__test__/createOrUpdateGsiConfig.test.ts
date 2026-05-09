import { describe, expect, it } from "vitest";
import { createOrUpdateGsiConfig } from "../createOrUpdateGsiConfig";
import type { ConfigPort } from "../../ports/ConfigPort";
import type { Cs2InstallLocatorPort } from "../../ports/Cs2InstallLocatorPort";
import type { GsiConfigFilePort, GsiCfgPayload } from "../../ports/GsiConfigFilePort";

describe("createOrUpdateGsiConfig", () => {
  it("writes cfg using configured port", async () => {
    let capturedPayload: GsiCfgPayload | undefined;

    const cfgPort: ConfigPort = {
      getConfig: async () => ({ port: 4000 }),
      saveConfig: async () => {},
    };
    const cs2Install: Cs2InstallLocatorPort = {
      detect: async () => ({
        installPath: "C:/cs2",
        cfgPath: "C:/cs2/game/csgo/cfg",
        steamLibraryPath: "C:/steam",
      }),
      validate: async () => null,
    };
    const gsiFile: GsiConfigFilePort = {
      isInstalled: async () => false,
      read: async () => null,
      write: async (cfgDir, payload) => {
        capturedPayload = payload;
        return { filePath: `${cfgDir}/gamestate_integration_cs2helper.cfg`, payload };
      },
      remove: async () => {},
    };

    const result = await createOrUpdateGsiConfig([cfgPort, cs2Install, gsiFile]);

    expect(result.port).toBe(4000);
    expect(result.endpointUrl).toBe("http://127.0.0.1:4000");
    expect(capturedPayload?.name).toBe("cs2helper");
    expect(capturedPayload?.endpointUrl).toBe("http://127.0.0.1:4000");
  });

  it("fails when CS2 install cannot be detected", async () => {
    const cfgPort: ConfigPort = {
      getConfig: async () => ({ port: 3000 }),
      saveConfig: async () => {},
    };
    const cs2Install: Cs2InstallLocatorPort = {
      detect: async () => null,
      validate: async () => null,
    };
    const gsiFile: GsiConfigFilePort = {
      isInstalled: async () => false,
      read: async () => null,
      write: async () => ({ filePath: "x", payload: { name: "x", endpointUrl: "x" } }),
      remove: async () => {},
    };

    await expect(createOrUpdateGsiConfig([cfgPort, cs2Install, gsiFile])).rejects.toThrow(
      /installation not found/i
    );
  });
});

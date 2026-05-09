import { describe, expect, it } from "vitest";
import { DEFAULT_CLI_CONFIG } from "../../../../domain/cli/config";
import { verifyGsiConfig } from "../verifyGsiConfig";
import type { ConfigPort } from "../../ports/ConfigPort";
import type { Cs2InstallLocatorPort } from "../../ports/Cs2InstallLocatorPort";
import type { GsiConfigFilePort } from "../../ports/GsiConfigFilePort";

const config = (port?: number): ConfigPort => ({
  getConfig: async () => ({ port }),
  saveConfig: async () => {},
});

const cs2Install = (cfgPath: string | null): Cs2InstallLocatorPort => ({
  detect: async () =>
    cfgPath
      ? {
          installPath: "C:/cs2",
          cfgPath,
          steamLibraryPath: "C:/steam",
        }
      : null,
  validate: async () => null,
});

const gsiFile = (endpointUrl?: string): GsiConfigFilePort => ({
  isInstalled: async () => endpointUrl !== undefined,
  read: async () =>
    endpointUrl === undefined
      ? null
      : {
          filePath: "C:/cfg/gamestate_integration_cs2helper.cfg",
          payload: {
            name: "cs2helper",
            endpointUrl,
            throttle: DEFAULT_CLI_CONFIG.gsiThrottleSec,
            heartbeat: DEFAULT_CLI_CONFIG.gsiHeartbeatSec,
          },
        },
  write: async () => ({ filePath: "x", payload: { name: "cs2helper", endpointUrl: "x" } }),
  remove: async () => {},
});

describe("verifyGsiConfig", () => {
  it("warns when cfg file is missing", async () => {
    const result = await verifyGsiConfig([
      config(3000),
      cs2Install("C:/cfg"),
      gsiFile(undefined),
    ]);
    expect(result.ok).toBe(false);
    expect(result.warningMessage).toContain("missing");
  });

  it("warns when cfg endpoint port mismatches", async () => {
    const result = await verifyGsiConfig([
      config(3000),
      cs2Install("C:/cfg"),
      gsiFile("http://127.0.0.1:4000"),
    ]);
    expect(result.ok).toBe(false);
    expect(result.warningMessage).toContain("mismatch");
  });

  it("returns ok when cfg endpoint port matches", async () => {
    const result = await verifyGsiConfig([
      config(3000),
      cs2Install("C:/cfg"),
      gsiFile("http://127.0.0.1:3000"),
    ]);
    expect(result.ok).toBe(true);
    expect(result.warningMessage).toBeUndefined();
  });
});

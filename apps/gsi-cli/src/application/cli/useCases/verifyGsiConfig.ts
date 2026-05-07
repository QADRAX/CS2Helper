import type { AsyncUseCase } from "@cs2helper/shared";
import type { ConfigPort } from "../ports/ConfigPort";
import type { Cs2InstallLocatorPort } from "../ports/Cs2InstallLocatorPort";
import type { GsiConfigFilePort } from "../ports/GsiConfigFilePort";

export interface VerifyGsiConfigPorts {
  config: ConfigPort;
  cs2Install: Cs2InstallLocatorPort;
  gsiConfigFile: GsiConfigFilePort;
}

export interface VerifyGsiConfigResult {
  ok: boolean;
  warningMessage?: string;
}

const GSI_NAME = "cs2helper";

/**
 * Validates that CS2 has a readable `gamestate_integration_cs2helper.cfg`
 * and that its endpoint points to the configured gateway port.
 *
 * This use case is warning-oriented: callers decide whether to block or not.
 */
export const verifyGsiConfig: AsyncUseCase<
  VerifyGsiConfigPorts,
  [],
  VerifyGsiConfigResult
> = async ({ config, cs2Install, gsiConfigFile }) => {
  const cliConfig = await config.getConfig();
  const expectedPort = cliConfig.port;
  if (!Number.isFinite(expectedPort) || (expectedPort ?? 0) <= 0) {
    return {
      ok: false,
      warningMessage: "GSI cfg check skipped: configure a valid gateway port first.",
    };
  }

  const cs2Location = await cs2Install.detect();
  if (!cs2Location) {
    return {
      ok: false,
      warningMessage: "CS2 installation not found; cannot verify gamestate_integration_cs2helper.cfg.",
    };
  }

  const installed = await gsiConfigFile.read(cs2Location.cfgPath, GSI_NAME);
  if (!installed) {
    return {
      ok: false,
      warningMessage: "CS2 cfg missing: create gamestate_integration_cs2helper.cfg from Config.",
    };
  }

  const endpointUrl = installed.payload?.endpointUrl;
  if (!endpointUrl) {
    return {
      ok: false,
      warningMessage: "CS2 cfg is unreadable or missing endpoint URL.",
    };
  }

  const endpointPort = tryReadPort(endpointUrl);
  if (endpointPort === null) {
    return {
      ok: false,
      warningMessage: `CS2 cfg endpoint is invalid: ${endpointUrl}`,
    };
  }

  if (endpointPort !== expectedPort) {
    return {
      ok: false,
      warningMessage: `CS2 cfg port mismatch: cfg uses ${endpointPort}, app uses ${expectedPort}.`,
    };
  }

  return { ok: true };
};

const tryReadPort = (endpointUrl: string): number | null => {
  try {
    const url = new URL(endpointUrl);
    if (url.port) {
      const parsed = Number.parseInt(url.port, 10);
      return Number.isFinite(parsed) ? parsed : null;
    }
    if (url.protocol === "http:") return 80;
    if (url.protocol === "https:") return 443;
    return null;
  } catch {
    return null;
  }
};

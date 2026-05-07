import type { AsyncUseCase } from "@cs2helper/shared";
import type { ConfigPort } from "../ports/ConfigPort";
import type { Cs2InstallLocatorPort } from "../ports/Cs2InstallLocatorPort";
import type { GsiCfgPayload, GsiConfigFilePort } from "../ports/GsiConfigFilePort";

export interface CreateOrUpdateGsiConfigPorts {
  config: ConfigPort;
  cs2Install: Cs2InstallLocatorPort;
  gsiConfigFile: GsiConfigFilePort;
}

export interface CreateOrUpdateGsiConfigResult {
  filePath: string;
  endpointUrl: string;
  port: number;
}

const GSI_NAME = "cs2helper";

/**
 * Materializes/updates CS2's `gamestate_integration_cs2helper.cfg` using
 * the currently configured gateway port.
 */
export const createOrUpdateGsiConfig: AsyncUseCase<
  CreateOrUpdateGsiConfigPorts,
  [],
  CreateOrUpdateGsiConfigResult
> = async ({ config, cs2Install, gsiConfigFile }) => {
  const cliConfig = await config.getConfig();
  const configuredPort = cliConfig.port;
  if (!Number.isFinite(configuredPort) || (configuredPort ?? 0) <= 0) {
    throw new Error("Set a valid port before creating CS2 cfg.");
  }
  const port = Number(configuredPort);
  const throttle = clampPositive(cliConfig.gsiThrottleSec, 0.1);
  const heartbeat = clampPositive(cliConfig.gsiHeartbeatSec, 10);

  const cs2Location = await cs2Install.detect();
  if (!cs2Location) {
    throw new Error("CS2 installation not found via Steam autodetection.");
  }

  const endpointUrl = `http://127.0.0.1:${port}`;
  const payload: GsiCfgPayload = {
    name: GSI_NAME,
    displayName: GSI_NAME,
    endpointUrl,
    timeout: 5,
    buffer: 0.1,
    throttle,
    heartbeat,
    data: {
      provider: true,
      map: true,
      round: true,
      player_id: true,
      player_state: true,
      player_match_stats: true,
      allplayers_id: true,
      allplayers_state: true,
      allplayers_match_stats: true,
      allplayers_weapons: true,
      allgrenades: true,
      bomb: true,
      phase_countdowns: true,
    },
  };

  const written = await gsiConfigFile.write(cs2Location.cfgPath, payload);
  return { filePath: written.filePath, endpointUrl, port };
};

const clampPositive = (value: number | undefined, fallback: number): number => {
  if (!Number.isFinite(value) || (value ?? 0) <= 0) return fallback;
  return Number(value);
};

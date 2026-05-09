import type { AsyncUseCase } from "@cs2helper/shared";
import type { GatewayPort, GatewayStartInfo } from "../ports/GatewayPort";
import type { ConfigPort } from "../ports/ConfigPort";
import type { Cs2InstallLocatorPort } from "../ports/Cs2InstallLocatorPort";
import type { GsiConfigFilePort } from "../ports/GsiConfigFilePort";
import type { RecorderPort } from "../ports/RecorderPort";
import { buildRecordingFilePath } from "../../../infrastructure/cli/adapters/appDataPaths";
import { startRecording } from "./startRecording";
import { verifyGsiConfig } from "./verifyGsiConfig";

/**
 * Initializes and starts the GSI Gateway service.
 *
 * Ports tuple order: `[gateway, config, cs2Install, gsiConfigFile, recorder]`.
 */
export const startGateway: AsyncUseCase<
  [GatewayPort, ConfigPort, Cs2InstallLocatorPort, GsiConfigFilePort, RecorderPort],
  [],
  GatewayStartInfo
> = async ([gateway, config, cs2Install, gsiConfigFile, recorder]) => {
  if (gateway.isRunning()) {
    await gateway.stop();
  }

  let gsiWarning: string | undefined;
  try {
    const verification = await verifyGsiConfig([config, cs2Install, gsiConfigFile]);
    gsiWarning = verification.warningMessage;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown verification failure";
    gsiWarning = `Could not verify CS2 cfg: ${message}`;
  }

  const currentConfig = await config.getConfig();
  const startInfo = await gateway.start({ port: currentConfig.port });
  if (currentConfig.autoRecordRawGsiOnStart) {
    await startRecording([gateway, recorder], buildRecordingFilePath());
  }
  return { ...startInfo, gsiWarning };
};

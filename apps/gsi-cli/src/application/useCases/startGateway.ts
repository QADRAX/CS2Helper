import type { AsyncUseCase } from "@cs2helper/shared";
import type { GatewayStartInfo } from "../ports/GatewayPort";
import type { ConfigPort } from "../ports/ConfigPort";
import type { Cs2ClientListenerCliPort } from "../ports/Cs2ClientListenerCliPort";
import type { Cs2InstallLocatorPort } from "../ports/Cs2InstallLocatorPort";
import type { GsiConfigFilePort } from "../ports/GsiConfigFilePort";
import { buildRecordingFilePath } from "../../infrastructure/adapters/appDataPaths";
import { startRecording } from "./startRecording";
import { verifyGsiConfig } from "./verifyGsiConfig";

/**
 * Initializes and starts the CS2 client listener (GSI gateway + aligned performance + tick hub).
 *
 * Ports tuple order: `[listener, config, cs2Install, gsiConfigFile]`.
 */
export const startGateway: AsyncUseCase<
  [Cs2ClientListenerCliPort, ConfigPort, Cs2InstallLocatorPort, GsiConfigFilePort],
  [],
  GatewayStartInfo
> = async ([listener, config, cs2Install, gsiConfigFile]) => {
  if (listener.isRunning()) {
    await listener.stop();
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
  const startInfo = await listener.start({ port: currentConfig.port });
  if (currentConfig.autoRecordClientTicksOnStart) {
    await startRecording([listener], buildRecordingFilePath());
  }
  return { port: startInfo.gatewayPort, gsiWarning };
};

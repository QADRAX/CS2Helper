import type { AsyncUseCase } from "@cs2helper/shared";
import type { GatewayPort, GatewayStartInfo } from "../ports/GatewayPort";
import type { ConfigPort } from "../ports/ConfigPort";
import type { Cs2InstallLocatorPort } from "../ports/Cs2InstallLocatorPort";
import type { GsiConfigFilePort } from "../ports/GsiConfigFilePort";
import { verifyGsiConfig } from "./verifyGsiConfig";

export interface StartGatewayPorts {
  gateway: GatewayPort;
  config: ConfigPort;
  cs2Install: Cs2InstallLocatorPort;
  gsiConfigFile: GsiConfigFilePort;
}

/**
 * Initializes and starts the GSI Gateway service.
 */
export const startGateway: AsyncUseCase<StartGatewayPorts, [], GatewayStartInfo> = async ({
  gateway,
  config,
  cs2Install,
  gsiConfigFile,
}) => {
  if (gateway.isRunning()) {
    await gateway.stop();
  }

  let gsiWarning: string | undefined;
  try {
    const verification = await verifyGsiConfig({ config, cs2Install, gsiConfigFile });
    gsiWarning = verification.warningMessage;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown verification failure";
    gsiWarning = `Could not verify CS2 cfg: ${message}`;
  }

  const currentConfig = await config.getConfig();
  const startInfo = await gateway.start({ port: currentConfig.port });
  return { ...startInfo, gsiWarning };
};

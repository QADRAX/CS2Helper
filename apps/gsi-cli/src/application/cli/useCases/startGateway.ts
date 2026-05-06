import type { AsyncUseCase } from "@cs2helper/shared";
import type { GatewayPort, GatewayStartInfo } from "../ports/GatewayPort";
import type { ConfigPort } from "../ports/ConfigPort";

export interface StartGatewayPorts {
  gateway: GatewayPort;
  config: ConfigPort;
}

/**
 * Initializes and starts the GSI Gateway service.
 */
export const startGateway: AsyncUseCase<StartGatewayPorts, [], GatewayStartInfo> = async ({
  gateway,
  config,
}) => {
  if (gateway.isRunning()) {
    await gateway.stop();
  }

  const currentConfig = await config.getConfig();
  return gateway.start({ port: currentConfig.port });
};

import { GsiGatewayService, type GsiGatewayStartInfo } from "@cs2helper/gsi-gateway";
import type { AsyncUseCase } from "@cs2helper/shared";
import type { GatewayPort } from "../ports/GatewayPort";
import type { ConfigPort } from "../ports/ConfigPort";

export interface StartGatewayPorts {
  gateway: GatewayPort;
  config: ConfigPort;
}

/**
 * Initializes and starts the GSI Gateway service.
 */
export const startGateway: AsyncUseCase<StartGatewayPorts, [], GsiGatewayStartInfo> = async ({
  gateway: gatewayPort,
  config: configPort,
}) => {
  const existing = gatewayPort.getGateway();
  if (existing) {
    await existing.stop();
  }

  const config = await configPort.getConfig();
  const gateway = new GsiGatewayService({
    port: config.port,
  });

  const info = await gateway.start();
  gatewayPort.setGateway(gateway);
  
  return info;
};

import { createGsiGatewayService } from "@cs2helper/gsi-gateway";
import type { GatewayPort } from "../ports/GatewayPort";
import type { ConfigPort } from "../ports/ConfigPort";

export const startGateway = async (gatewayPort: GatewayPort, configPort: ConfigPort) => {
  const existing = gatewayPort.getGateway();
  if (existing) {
    await existing.stop();
  }

  const config = await configPort.getConfig();
  const gateway = createGsiGatewayService({
    port: config.port,
  });

  const info = await gateway.start();
  gatewayPort.setGateway(gateway);
  
  return info;
};

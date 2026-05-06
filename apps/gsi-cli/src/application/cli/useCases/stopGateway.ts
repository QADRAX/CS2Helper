import type { GatewayPort } from "../ports/GatewayPort";

export const stopGateway = async (gatewayPort: GatewayPort) => {
  const gateway = gatewayPort.getGateway();
  if (gateway) {
    await gateway.stop();
    gatewayPort.setGateway(null);
  }
};

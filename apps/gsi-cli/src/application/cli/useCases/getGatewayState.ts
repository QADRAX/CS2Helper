import type { GatewayPort } from "../ports/GatewayPort";

export const getGatewayState = (gatewayPort: GatewayPort) => {
  const gateway = gatewayPort.getGateway();
  return gateway ? gateway.getState() : null;
};

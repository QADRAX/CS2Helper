import type { AsyncUseCase } from "@cs2helper/shared";
import type { GatewayPort } from "../ports/GatewayPort";

export interface StopGatewayPorts {
  gateway: GatewayPort;
}

/**
 * Stops the currently active GSI Gateway service.
 */
export const stopGateway: AsyncUseCase<StopGatewayPorts, [], void> = async ({
  gateway: gatewayPort,
}) => {
  const active = gatewayPort.getGateway();
  if (active) {
    await active.stop();
    gatewayPort.setGateway(null);
  }
};

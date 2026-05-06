import type { AsyncUseCase } from "@cs2helper/shared";
import type { GatewayPort } from "../ports/GatewayPort";

export interface StopGatewayPorts {
  gateway: GatewayPort;
}

/**
 * Stops the currently active GSI Gateway service.
 */
export const stopGateway: AsyncUseCase<StopGatewayPorts, [], void> = async ({
  gateway,
}) => {
  if (gateway.isRunning()) {
    await gateway.stop();
  }
};

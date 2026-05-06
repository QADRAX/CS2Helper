import type { UseCase } from "@cs2helper/shared";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { GatewayPort } from "../ports/GatewayPort";

export interface SubscribeGatewayStatePorts {
  gateway: GatewayPort;
}

/**
 * Subscribes to state changes from the active gateway.
 */
export const subscribeGatewayState: UseCase<
  SubscribeGatewayStatePorts,
  [listener: (state: Readonly<GsiProcessorState>) => void],
  () => void
> = ({ gateway }, listener) => {
  return gateway.subscribeState(listener);
};

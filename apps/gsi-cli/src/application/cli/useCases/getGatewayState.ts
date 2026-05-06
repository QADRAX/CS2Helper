import type { UseCase } from "@cs2helper/shared";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { GatewayPort } from "../ports/GatewayPort";

export interface GetGatewayStatePorts {
  gateway: GatewayPort;
}

/**
 * Returns the current state of the active gateway, or null if not running.
 */
export const getGatewayState: UseCase<
  GetGatewayStatePorts,
  [],
  Readonly<GsiProcessorState> | null
> = ({ gateway }) => {
  return gateway.getState();
};

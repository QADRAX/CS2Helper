import type { UseCase } from "@cs2helper/shared";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { GatewayPort } from "../ports/GatewayPort";

/**
 * Returns the current state of the active gateway, or null if not running.
 *
 * Ports tuple order: `[gateway]`.
 */
export const getGatewayState: UseCase<
  [GatewayPort],
  [],
  Readonly<GsiProcessorState> | null
> = ([gateway]) => {
  return gateway.getState();
};

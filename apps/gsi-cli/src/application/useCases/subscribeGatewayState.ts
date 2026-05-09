import type { UseCase } from "@cs2helper/shared";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { GatewayPort } from "../ports/GatewayPort";

/**
 * Subscribes to state changes from the active gateway.
 *
 * Ports tuple order: `[gateway]`.
 */
export const subscribeGatewayState: UseCase<
  [GatewayPort],
  [listener: (state: Readonly<GsiProcessorState>) => void],
  () => void
> = ([gateway], listener) => {
  return gateway.subscribeState(listener);
};

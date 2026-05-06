import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { GatewayPort } from "../ports/GatewayPort";

export const subscribeGatewayState = (gatewayPort: GatewayPort, listener: (state: Readonly<GsiProcessorState>) => void) => {
  const gateway = gatewayPort.getGateway();
  if (!gateway) return () => {};
  return gateway.subscribeState(listener);
};

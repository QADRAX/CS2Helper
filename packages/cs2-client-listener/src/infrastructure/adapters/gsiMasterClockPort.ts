import type { GsiGateway } from "@cs2helper/gsi-gateway";
import type { MasterClockPort } from "@cs2helper/tick-hub";

/**
 * Master clock: one {@link MasterTickSignal} per GSI POST (`data` = latest processor state + raw body).
 */
export function createGsiMasterClockPort(gateway: GsiGateway): MasterClockPort {
  return {
    subscribe(listener) {
      return gateway.subscribeRawTicks((raw) => {
        listener({ data: { state: gateway.getState(), raw } });
      });
    },
  };
}

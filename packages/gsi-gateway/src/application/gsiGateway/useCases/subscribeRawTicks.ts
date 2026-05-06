import type { UseCase } from "@cs2helper/shared";
import type { RawTicksSubscriptionPort } from "../ports";

export interface SubscribeRawTicksPorts {
  rawTickHub: RawTicksSubscriptionPort;
}

/**
 * Subscribes a listener to raw JSON strings received from the CS2 GSI hook.
 */
export const subscribeRawTicks: UseCase<
  SubscribeRawTicksPorts,
  [listener: (raw: string) => void],
  () => void
> = ({ rawTickHub }, listener) => rawTickHub.subscribe(listener);

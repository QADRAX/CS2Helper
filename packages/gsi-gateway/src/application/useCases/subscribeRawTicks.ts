import type { UseCase } from "@cs2helper/shared";
import type { RawTicksSubscriptionPort } from "../ports";

/**
 * Subscribes a listener to raw JSON strings received from the CS2 GSI hook.
 *
 * Ports tuple order: `[rawTickHub]`.
 */
export const subscribeRawTicks: UseCase<
  [RawTicksSubscriptionPort],
  [listener: (raw: string) => void],
  () => void
> = ([rawTickHub], listener) => rawTickHub.subscribe(listener);

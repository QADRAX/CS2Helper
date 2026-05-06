import type { UseCase } from "@cs2helper/shared";

export interface SubscribeRawTicksPorts {
  rawTickListeners: Set<(raw: string) => void>;
}

/**
 * Subscribes a listener to raw JSON strings received from the CS2 GSI hook.
 */
export const subscribeRawTicks: UseCase<
  SubscribeRawTicksPorts,
  [listener: (raw: string) => void],
  () => void
> = ({ rawTickListeners }, listener) => {
  rawTickListeners.add(listener);
  return () => {
    rawTickListeners.delete(listener);
  };
};

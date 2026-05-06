import type { UseCase } from "@cs2helper/shared";
import type { GsiProcessorEvent } from "@cs2helper/gsi-processor";
import type { ProcessorPort } from "../ports";

export interface SubscribeEventsPorts {
  processor: ProcessorPort;
}

/**
 * Subscribes to processor domain events.
 */
export const subscribeEvents: UseCase<
  SubscribeEventsPorts,
  [listener: (event: GsiProcessorEvent) => void],
  () => void
> = ({ processor }, listener) => {
  return processor.subscribeEvents(listener);
};

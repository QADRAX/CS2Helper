import type { UseCase } from "@cs2helper/shared";
import type { GsiProcessorEvent } from "@cs2helper/gsi-processor";
import type { ProcessorPort } from "../ports";

/**
 * Subscribes to processor domain events.
 *
 * Ports tuple order: `[processor]`.
 */
export const subscribeEvents: UseCase<
  [ProcessorPort],
  [listener: (event: GsiProcessorEvent) => void],
  () => void
> = ([processor], listener) => {
  return processor.subscribeEvents(listener);
};

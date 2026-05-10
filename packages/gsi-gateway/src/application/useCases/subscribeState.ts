import type { UseCase } from "@cs2helper/shared";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { ProcessorPort } from "../ports";

/**
 * Subscribes to processor aggregate state changes.
 *
 * Ports tuple order: `[processor]`.
 */
export const subscribeState: UseCase<
  [ProcessorPort],
  [listener: (state: Readonly<GsiProcessorState>) => void],
  () => void
> = ([processor], listener) => {
  return processor.subscribeState(listener);
};

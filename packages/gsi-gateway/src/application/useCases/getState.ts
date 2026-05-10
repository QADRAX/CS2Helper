import type { UseCase } from "@cs2helper/shared";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { ProcessorPort } from "../ports";

/**
 * Retrieves the latest aggregate state from the underlying processor.
 *
 * Ports tuple order: `[processor]`.
 */
export const getState: UseCase<[ProcessorPort], [], Readonly<GsiProcessorState>> = (
  [processor]
) => {
  return processor.getState();
};

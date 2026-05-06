import type { UseCase } from "@cs2helper/shared";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { ProcessorPort } from "../ports";

export interface SubscribeStatePorts {
  processor: ProcessorPort;
}

/**
 * Subscribes to processor aggregate state changes.
 */
export const subscribeState: UseCase<
  SubscribeStatePorts,
  [listener: (state: Readonly<GsiProcessorState>) => void],
  () => void
> = ({ processor }, listener) => {
  return processor.subscribeState(listener);
};

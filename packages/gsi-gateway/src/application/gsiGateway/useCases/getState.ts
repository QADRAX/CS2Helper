import type { UseCase } from "@cs2helper/shared";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { ProcessorPort } from "../ports";

export interface GetStatePorts {
  processor: ProcessorPort;
}

/**
 * Retrieves the latest aggregate state from the underlying processor.
 */
export const getState: UseCase<GetStatePorts, [], Readonly<GsiProcessorState>> = (
  { processor }
) => {
  return processor.getState();
};

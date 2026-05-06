import type { ProcessorPort } from "../ports";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";

export const subscribeState = (
  processorPort: ProcessorPort,
  listener: (state: Readonly<GsiProcessorState>) => void
) => {
  return processorPort.subscribeState(listener);
};

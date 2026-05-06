import type { ProcessorPort } from "../ports";
import type { GsiProcessorEvent } from "@cs2helper/gsi-processor";

export const subscribeEvents = (
  processorPort: ProcessorPort,
  listener: (event: GsiProcessorEvent) => void
) => {
  return processorPort.subscribeEvents(listener);
};

import type { UseCase } from "@cs2helper/shared";
import type { ProcessorPort, RawTickDispatchPort } from "../ports";

export interface IngestGsiTickPorts {
  processor: ProcessorPort;
  rawTickHub: RawTickDispatchPort;
}

/**
 * Entry point for a new GSI tick. 
 * Orchestrates domain processing and notifies raw observers.
 */
export const ingestGsiTick: UseCase<IngestGsiTickPorts, [tick: any, raw: string], void> = (
  { processor, rawTickHub },
  tick,
  raw
) => {
  // 1. Process through domain engine
  processor.processTick(tick);

  // 2. Notify raw tick subscribers
  rawTickHub.dispatchRawTick(raw);
};

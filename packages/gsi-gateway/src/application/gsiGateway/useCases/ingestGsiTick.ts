import type { UseCase } from "@cs2helper/shared";
import type { ProcessorPort } from "../ports";

export interface IngestGsiTickPorts {
  processor: ProcessorPort;
  rawTickListeners: Set<(raw: string) => void>;
}

/**
 * Entry point for a new GSI tick. 
 * Orchestrates domain processing and notifies raw observers.
 */
export const ingestGsiTick: UseCase<IngestGsiTickPorts, [tick: any, raw: string], void> = (
  { processor, rawTickListeners },
  tick,
  raw
) => {
  // 1. Process through domain engine
  processor.processTick(tick);

  // 2. Notify raw tick subscribers
  rawTickListeners.forEach((listener) => listener(raw));
};

import type { UseCase } from "@cs2helper/shared";
import type { ProcessorPort, RawTickDispatchPort } from "../ports";

/**
 * Entry point for a new GSI tick.
 * Orchestrates domain processing and notifies raw observers.
 *
 * Ports tuple order: `[processor, rawTickHub]`.
 */
export const ingestGsiTick: UseCase<
  [ProcessorPort, RawTickDispatchPort],
  [tick: any, raw: string],
  void
> = ([processor, rawTickHub], tick, raw) => {
  processor.processTick(tick);
  rawTickHub.dispatchRawTick(raw);
};

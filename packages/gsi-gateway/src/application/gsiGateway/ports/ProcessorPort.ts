import type { GsiProcessorEvent, GsiProcessorState } from "@cs2helper/gsi-processor";

/** Port to interact with the underlying GSI processor. */
export interface ProcessorPort {
  getState: () => Readonly<GsiProcessorState>;
  /**
   * Processes one CS2 GSI snapshot.
   * @param tick - Raw CS2 GSI tick.
   * @param timestamp - Optional event-time in milliseconds.
   */
  processTick: (tick: any, timestamp?: number) => void;
  subscribeState: (listener: (state: Readonly<GsiProcessorState>) => void) => () => void;
  subscribeEvents: (listener: (event: GsiProcessorEvent) => void) => () => void;
}

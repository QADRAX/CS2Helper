import type { GsiProcessorState } from "../../../domain/gsiProcessor/gsiProcessorTypes";

/** State persistence port used by application use cases. */
export interface StatePort {
  getState: () => Readonly<GsiProcessorState>;
  setState: (state: GsiProcessorState) => void;
  subscribeState: (listener: (state: Readonly<GsiProcessorState>) => void) => () => void;
}

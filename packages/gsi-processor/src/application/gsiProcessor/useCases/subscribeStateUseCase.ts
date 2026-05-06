import type { StatePort } from "../ports";
import type { GsiProcessorState } from "../../../domain/gsiProcessor/gsiProcessorTypes";

export const subscribeState = (
  statePort: StatePort,
  listener: (state: Readonly<GsiProcessorState>) => void
) => {
  return statePort.subscribeState(listener);
};

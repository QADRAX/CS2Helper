import type { UseCase } from "@cs2helper/shared";
import type { StatePort } from "../ports/StatePort";
import type { GsiProcessorState } from "../../../domain/gsiProcessor/gsiProcessorTypes";

export interface SubscribeStatePorts {
  state: StatePort;
}

/**
 * Subscribes a listener to aggregate state changes.
 */
export const subscribeState: UseCase<
  SubscribeStatePorts,
  [listener: (state: Readonly<GsiProcessorState>) => void],
  () => void
> = ({ state }, listener) => {
  return state.subscribeState(listener);
};

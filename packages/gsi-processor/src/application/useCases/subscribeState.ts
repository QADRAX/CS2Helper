import type { UseCase } from "@cs2helper/shared";
import type { GsiProcessorState } from "../../domain/gsiProcessorTypes";
import type { StatePort } from "../ports/StatePort";

/**
 * Subscribes a listener to aggregate state changes.
 *
 * Ports tuple order: `[state]`.
 */
export const subscribeState: UseCase<
  [StatePort],
  [listener: (state: Readonly<GsiProcessorState>) => void],
  () => void
> = ([state], listener) => {
  return state.subscribeState(listener);
};

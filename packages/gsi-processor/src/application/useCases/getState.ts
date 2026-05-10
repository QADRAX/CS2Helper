import type { UseCase } from "@cs2helper/shared";
import type { GsiProcessorState } from "../../domain/gsiProcessorTypes";
import type { StatePort } from "../ports/StatePort";

/**
 * Retrieves the latest aggregate state from the persistence port.
 *
 * Ports tuple order: `[state]`.
 */
export const getState: UseCase<[StatePort], [], Readonly<GsiProcessorState>> = ([state]) => {
  return state.getState();
};

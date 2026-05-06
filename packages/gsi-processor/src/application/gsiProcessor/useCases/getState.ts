import type { UseCase } from "@cs2helper/shared";
import type { StatePort } from "../ports/StatePort";
import type { GsiProcessorState } from "../../../domain/gsiProcessor/gsiProcessorTypes";

export interface GetStatePorts {
  state: StatePort;
}

/**
 * Retrieves the latest aggregate state from the persistence port.
 */
export const getState: UseCase<GetStatePorts, [], Readonly<GsiProcessorState>> = (
  { state }
) => {
  return state.getState();
};

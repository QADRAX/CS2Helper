import type { StatePort } from "../ports";

export const getState = (statePort: StatePort) => {
  return statePort.getState();
};

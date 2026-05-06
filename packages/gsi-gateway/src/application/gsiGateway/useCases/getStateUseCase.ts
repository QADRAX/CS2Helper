import type { ProcessorPort } from "../ports";

export const getState = (processorPort: ProcessorPort) => {
  return processorPort.getState();
};

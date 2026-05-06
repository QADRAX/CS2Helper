import type { ProcessorPort } from "../ports";

export const ingestGsiTick = (
  processorPort: ProcessorPort,
  rawTickListeners: Set<(raw: string) => void>,
  tick: any,
  raw: string
) => {
  // 1. Process the tick through the domain engine. 
  // We don't pass 'raw' here as the processor only needs the parsed tick.
  processorPort.processTick(tick);

  // 2. Notify raw tick subscribers (usually for recorders or debuggers)
  rawTickListeners.forEach((listener) => listener(raw));
};

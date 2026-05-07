import type { AsyncUseCase } from "@cs2helper/shared";
import type { Cs2ProcessPort, Cs2ProcessStatus } from "../ports/Cs2ProcessPort";

export interface GetCs2StatusPorts {
  cs2Process: Cs2ProcessPort;
}

/**
 * Returns the current CS2 process status (running flag + pid).
 */
export const getCs2Status: AsyncUseCase<GetCs2StatusPorts, [], Cs2ProcessStatus> = ({
  cs2Process,
}) => cs2Process.getStatus();

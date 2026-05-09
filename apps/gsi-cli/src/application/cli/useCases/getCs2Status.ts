import type { AsyncUseCase } from "@cs2helper/shared";
import type { Cs2ProcessPort, Cs2ProcessStatus } from "../ports";

/**
 * Returns the current CS2 process status (running flag + pid).
 *
 * Ports tuple order: `[cs2Process]`.
 */
export const getCs2Status: AsyncUseCase<[Cs2ProcessPort], [], Cs2ProcessStatus> = ([cs2Process]) =>
  cs2Process.getStatus();

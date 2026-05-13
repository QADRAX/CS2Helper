import type { UseCase } from "@cs2helper/shared";
import type { DedicatedStatusStatePort } from "../ports/DedicatedStatusStatePort";

/**
 * Ports tuple order: `[state]`.
 */
export const recordOperationalFailure: UseCase<[DedicatedStatusStatePort], [error: unknown], void> = (
  [state],
  error
) => {
  state.setPhase("error");
  state.setLastUpdateError(error instanceof Error ? error.message : String(error));
};

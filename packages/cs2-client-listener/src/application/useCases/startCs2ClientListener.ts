import type { AsyncUseCase } from "@cs2helper/shared";
import { Cs2ClientListenerAlreadyRunningError, type Cs2ClientListenerStartResult } from "../../domain";
import type { Cs2ClientListenerControlPort } from "../ports/Cs2ClientListenerControlPort";

/**
 * Starts the embedded GSI gateway and performance processor, then wires the tick hub.
 *
 * Ports tuple order: `[control]`.
 *
 * @throws {@link Cs2ClientListenerAlreadyRunningError} when already active.
 */
export const startCs2ClientListener: AsyncUseCase<
  [Cs2ClientListenerControlPort],
  [],
  Cs2ClientListenerStartResult
> = async ([control]) => {
  if (control.isRunning()) {
    throw new Cs2ClientListenerAlreadyRunningError();
  }
  return control.enterRunningMode();
};

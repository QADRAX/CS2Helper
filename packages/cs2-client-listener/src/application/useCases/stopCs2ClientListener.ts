import type { AsyncUseCase } from "@cs2helper/shared";
import type { Cs2ClientListenerControlPort } from "../ports/Cs2ClientListenerControlPort";

/**
 * Stops the gateway and tears down hub subscriptions. Idempotent if already idle.
 *
 * Ports tuple order: `[control]`.
 */
export const stopCs2ClientListener: AsyncUseCase<[Cs2ClientListenerControlPort], [], void> = async ([control]) => {
  if (!control.isRunning()) {
    return;
  }
  await control.exitRunningMode();
};

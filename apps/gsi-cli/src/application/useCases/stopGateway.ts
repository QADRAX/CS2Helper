import type { AsyncUseCase } from "@cs2helper/shared";
import type { Cs2ClientListenerCliPort } from "../ports/Cs2ClientListenerCliPort";

/**
 * Stops the CS2 client listener and any active tick recording.
 *
 * Ports tuple order: `[listener]`.
 */
export const stopGateway: AsyncUseCase<[Cs2ClientListenerCliPort], [], void> = async ([listener]) => {
  await listener.stopRecording();
  if (listener.isRunning()) {
    await listener.stop();
  }
};

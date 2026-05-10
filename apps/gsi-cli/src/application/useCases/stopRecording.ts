import type { AsyncUseCase } from "@cs2helper/shared";
import type { Cs2ClientListenerCliPort } from "../ports/Cs2ClientListenerCliPort";

/**
 * Stops tick JSONL recording if active.
 *
 * Ports tuple order: `[listener]`.
 */
export const stopRecording: AsyncUseCase<[Cs2ClientListenerCliPort], [], void> = async ([listener]) => {
  await listener.stopRecording();
};

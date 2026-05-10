import type { AsyncUseCase } from "@cs2helper/shared";
import type { Cs2ClientListenerCliPort } from "../ports/Cs2ClientListenerCliPort";

/**
 * Begins JSONL recording of {@link TickFrame} lines via the client listener tick hub.
 *
 * Ports tuple order: `[listener]`.
 */
export const startRecording: AsyncUseCase<[Cs2ClientListenerCliPort], [filename: string], void> = async (
  [listener],
  filename
) => {
  if (!listener.isRunning()) {
    throw new Error("Cannot start recording: CS2 client listener is not running.");
  }

  listener.startRecording(filename);
};

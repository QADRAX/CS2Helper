import type { AsyncUseCase } from "@cs2helper/shared";
import type { RecorderPort } from "../ports/RecorderPort";

/**
 * Stops the current recording session and closes the file.
 *
 * Ports tuple order: `[recorder]`.
 */
export const stopRecording: AsyncUseCase<[RecorderPort], [], void> = async ([recorder]) => {
  await recorder.close();
};

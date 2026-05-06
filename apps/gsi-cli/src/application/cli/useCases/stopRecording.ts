import type { AsyncUseCase } from "@cs2helper/shared";
import type { RecorderPort } from "../ports/RecorderPort";

export interface StopRecordingPorts {
  recorder: RecorderPort;
}

/**
 * Stops the current recording session and closes the file.
 */
export const stopRecording: AsyncUseCase<StopRecordingPorts, [], void> = async ({
  recorder,
}) => {
  await recorder.close();
};

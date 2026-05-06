import type { RecorderPort } from "../ports/RecorderPort";

export const stopRecording = async (recorderPort: RecorderPort) => {
  await recorderPort.stop();
};

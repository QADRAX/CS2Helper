import type { AsyncUseCase } from "@cs2helper/shared";
import type { GatewayPort } from "../ports/GatewayPort";
import type { RecorderPort } from "../ports/RecorderPort";

export interface StartRecordingPorts {
  gateway: GatewayPort;
  recorder: RecorderPort;
}

/**
 * Begins recording raw CS2 GSI payloads to a file.
 * Each tick is the unprocessed JSON body sent by CS2 via HTTP POST.
 */
export const startRecording: AsyncUseCase<
  StartRecordingPorts,
  [filename: string],
  void
> = async ({ gateway, recorder }, filename) => {
  if (!gateway.isRunning()) {
    throw new Error("Cannot start recording: GSI Gateway is not running.");
  }

  await recorder.open(filename);

  const unsub = gateway.subscribeRawTicks((raw) => {
    recorder.writeTick(raw).catch(() => {});
  });

  if (unsub) {
    recorder.setUnsubscribe(unsub);
  }
};

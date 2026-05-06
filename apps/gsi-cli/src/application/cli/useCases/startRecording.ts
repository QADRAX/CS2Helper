import type { AsyncUseCase } from "@cs2helper/shared";
import type { GatewayPort } from "../ports/GatewayPort";
import type { RecorderPort } from "../ports/RecorderPort";

export interface StartRecordingPorts {
  gateway: GatewayPort;
  recorder: RecorderPort;
}

/**
 * Begins recording processed GSI ticks to a file.
 */
export const startRecording: AsyncUseCase<
  StartRecordingPorts,
  [filename: string],
  void
> = async ({ gateway, recorder }, filename) => {
  const activeGateway = gateway.getGateway();
  if (!activeGateway) {
    throw new Error("Cannot start recording: GSI Gateway is not running.");
  }

  // 1. Prepare the recorder
  await recorder.open(filename);

  // 2. Write initial state as the first snapshot for context
  const initialState = activeGateway.getState();
  await recorder.writeTick(JSON.stringify(initialState));

  // 3. Subscribe to subsequent ticks
  const unsub = gateway.subscribeRawTicks(async (raw) => {
    await recorder.writeTick(raw);
  });

  if (unsub) {
    recorder.setUnsubscribe(unsub);
  }
};

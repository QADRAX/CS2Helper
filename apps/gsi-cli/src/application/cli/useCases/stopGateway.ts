import type { AsyncUseCase } from "@cs2helper/shared";
import type { GatewayPort } from "../ports/GatewayPort";
import type { RecorderPort } from "../ports/RecorderPort";
import { stopRecording } from "./stopRecording";

/**
 * Stops the currently active GSI Gateway service.
 *
 * Ports tuple order: `[gateway, recorder]`.
 */
export const stopGateway: AsyncUseCase<[GatewayPort, RecorderPort], [], void> = async ([
  gateway,
  recorder,
]) => {
  if (recorder.isRecording()) {
    await stopRecording([recorder]);
  }
  if (gateway.isRunning()) {
    await gateway.stop();
  }
};

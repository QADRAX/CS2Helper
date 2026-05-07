import type { AsyncUseCase } from "@cs2helper/shared";
import type { GatewayPort } from "../ports/GatewayPort";
import type { RecorderPort } from "../ports/RecorderPort";
import { stopRecording } from "./stopRecording";

export interface StopGatewayPorts {
  gateway: GatewayPort;
  recorder: RecorderPort;
}

/**
 * Stops the currently active GSI Gateway service.
 */
export const stopGateway: AsyncUseCase<StopGatewayPorts, [], void> = async ({
  gateway,
  recorder,
}) => {
  if (recorder.isRecording()) {
    await stopRecording({ recorder });
  }
  if (gateway.isRunning()) {
    await gateway.stop();
  }
};

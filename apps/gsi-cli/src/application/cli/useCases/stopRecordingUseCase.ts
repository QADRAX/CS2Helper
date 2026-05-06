import type { CliGatewayContext } from "../../../domain/cli/contracts";
import type { StopRecordingUseCase } from "../../../domain/cli/useCases";

export function createStopRecordingUseCase(context: CliGatewayContext): StopRecordingUseCase {
  return {
    execute: async () => {
      await context.recorderManager.stop();
    },
  };
}

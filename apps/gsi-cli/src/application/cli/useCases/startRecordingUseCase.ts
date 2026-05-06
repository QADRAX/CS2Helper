import type { CliGatewayContext } from "../../../domain/cli/contracts";
import type { StartRecordingUseCase } from "../../../domain/cli/useCases";

export function createStartRecordingUseCase(context: CliGatewayContext): StartRecordingUseCase {
  return {
    execute: async (filename: string) => {
      await context.recorderManager.start(filename);
    },
  };
}

import type { GsiGatewayStartInfo, GsiGatewayService } from "@cs2helper/gsi-gateway";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import { createStartGatewayUseCase } from "../../application/cli/useCases/startGatewayUseCase";
import { createStopGatewayUseCase } from "../../application/cli/useCases/stopGatewayUseCase";
import { createGetGatewayStateUseCase } from "../../application/cli/useCases/getGatewayStateUseCase";
import { createSubscribeGatewayStateUseCase } from "../../application/cli/useCases/subscribeGatewayStateUseCase";
import { createGetConfigUseCase } from "../../application/cli/useCases/getConfigUseCase";
import { createSaveConfigUseCase } from "../../application/cli/useCases/saveConfigUseCase";
import { createStartRecordingUseCase } from "../../application/cli/useCases/startRecordingUseCase";
import { createStopRecordingUseCase } from "../../application/cli/useCases/stopRecordingUseCase";
import { createFileConfigStore } from "./FileConfigStore";
import { createFileRecorder } from "./FileRecorder";
import type { CliConfig } from "../../domain/cli/config";

export interface CliAppService {
  startGateway: () => Promise<GsiGatewayStartInfo>;
  stopGateway: () => Promise<void>;
  getGatewayState: () => Readonly<GsiProcessorState> | null;
  subscribeGatewayState: (listener: (state: Readonly<GsiProcessorState>) => void) => () => void;
  getConfig: () => Promise<CliConfig>;
  saveConfig: (config: Partial<CliConfig>) => Promise<CliConfig>;
  startRecording: (filename: string) => Promise<void>;
  stopRecording: () => Promise<void>;
}

export function createCliAppService(): CliAppService {
  let activeGateway: GsiGatewayService | null = null;
  let recorder = createFileRecorder();
  let stopRecordingSubscription: (() => void) | null = null;

  const context = {
    gatewayManager: {
      getGateway: () => activeGateway,
      setGateway: (gateway: GsiGatewayService | null) => {
        activeGateway = gateway;
      },
    },
    configStore: createFileConfigStore(),
    recorderManager: {
      async start(filename: string) {
        if (!activeGateway) {
          throw new Error("Gateway must be started before recording.");
        }
        await recorder.start(filename);
        stopRecordingSubscription = activeGateway.subscribeRawTicks((raw) => {
          recorder.write(raw).catch(console.error);
        });
      },
      async stop() {
        if (stopRecordingSubscription) {
          stopRecordingSubscription();
          stopRecordingSubscription = null;
        }
        await recorder.stop();
      },
    },
  };

  const startGatewayUseCase = createStartGatewayUseCase(context);
  const stopGatewayUseCase = createStopGatewayUseCase(context);
  const getGatewayStateUseCase = createGetGatewayStateUseCase(context);
  const subscribeGatewayStateUseCase = createSubscribeGatewayStateUseCase(context);
  const getConfigUseCase = createGetConfigUseCase(context);
  const saveConfigUseCase = createSaveConfigUseCase(context);
  const startRecordingUseCase = createStartRecordingUseCase(context);
  const stopRecordingUseCase = createStopRecordingUseCase(context);

  return {
    startGateway: startGatewayUseCase.execute,
    stopGateway: stopGatewayUseCase.execute,
    getGatewayState: getGatewayStateUseCase.execute,
    subscribeGatewayState: subscribeGatewayStateUseCase.execute,
    getConfig: getConfigUseCase.execute,
    saveConfig: saveConfigUseCase.execute,
    startRecording: startRecordingUseCase.execute,
    stopRecording: stopRecordingUseCase.execute,
  };
}

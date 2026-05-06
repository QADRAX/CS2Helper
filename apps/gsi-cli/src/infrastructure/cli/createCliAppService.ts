import type { GsiGatewayStartInfo, GsiGatewayService } from "@cs2helper/gsi-gateway";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import { createStartGatewayUseCase } from "../../application/cli/useCases/startGatewayUseCase.js";
import { createStopGatewayUseCase } from "../../application/cli/useCases/stopGatewayUseCase.js";
import { createGetGatewayStateUseCase } from "../../application/cli/useCases/getGatewayStateUseCase.js";
import { createSubscribeGatewayStateUseCase } from "../../application/cli/useCases/subscribeGatewayStateUseCase.js";
import { createGetConfigUseCase } from "../../application/cli/useCases/getConfigUseCase.js";
import { createSaveConfigUseCase } from "../../application/cli/useCases/saveConfigUseCase.js";
import { createFileConfigStore } from "./FileConfigStore.js";
import type { CliConfig } from "../../domain/cli/config.js";

export interface CliAppService {
  startGateway: () => Promise<GsiGatewayStartInfo>;
  stopGateway: () => Promise<void>;
  getGatewayState: () => Readonly<GsiProcessorState> | null;
  subscribeGatewayState: (listener: (state: Readonly<GsiProcessorState>) => void) => () => void;
  getConfig: () => Promise<CliConfig>;
  saveConfig: (config: Partial<CliConfig>) => Promise<CliConfig>;
}

export function createCliAppService(): CliAppService {
  let activeGateway: GsiGatewayService | null = null;

  const context = {
    gatewayManager: {
      getGateway: () => activeGateway,
      setGateway: (gateway: GsiGatewayService | null) => {
        activeGateway = gateway;
      },
    },
    configStore: createFileConfigStore(),
  };

  const startGatewayUseCase = createStartGatewayUseCase(context);
  const stopGatewayUseCase = createStopGatewayUseCase(context);
  const getGatewayStateUseCase = createGetGatewayStateUseCase(context);
  const subscribeGatewayStateUseCase = createSubscribeGatewayStateUseCase(context);
  const getConfigUseCase = createGetConfigUseCase(context);
  const saveConfigUseCase = createSaveConfigUseCase(context);

  return {
    startGateway: startGatewayUseCase.execute,
    stopGateway: stopGatewayUseCase.execute,
    getGatewayState: getGatewayStateUseCase.execute,
    subscribeGatewayState: subscribeGatewayStateUseCase.execute,
    getConfig: getConfigUseCase.execute,
    saveConfig: saveConfigUseCase.execute,
  };
}

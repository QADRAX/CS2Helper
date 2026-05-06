import type { GsiGatewayStartInfo, GsiGateway } from "@cs2helper/gsi-gateway";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import { getConfig } from "../../application/cli/useCases/getConfig";
import { saveConfig } from "../../application/cli/useCases/saveConfig";
import { startGateway } from "../../application/cli/useCases/startGateway";
import { stopGateway } from "../../application/cli/useCases/stopGateway";
import { getGatewayState } from "../../application/cli/useCases/getGatewayState";
import { subscribeGatewayState } from "../../application/cli/useCases/subscribeGatewayState";
import { startRecording } from "../../application/cli/useCases/startRecording";
import { stopRecording } from "../../application/cli/useCases/stopRecording";
import { FileConfigAdapter } from "./adapters/FileConfigAdapter";
import { FileRecorderAdapter } from "./adapters/FileRecorderAdapter";
import type { CliConfig } from "../../domain/cli/config";
import type { GatewayPort, ConfigPort, RecorderPort } from "../../application/cli/ports";

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
  // --- Infrastructure State & Adapters ---
  let activeGateway: GsiGateway | null = null;
  
  const gatewayAdapter: GatewayPort = {
    getGateway: () => activeGateway,
    setGateway: (gateway) => { activeGateway = gateway; },
    subscribeRawTicks: (listener) => {
      return activeGateway ? activeGateway.subscribeRawTicks(listener) : null;
    }
  };

  const configAdapter: ConfigPort = new FileConfigAdapter();
  const recorderAdapter: RecorderPort = new FileRecorderAdapter();

  // --- Public API Surface ---
  return {
    startGateway: () => startGateway({ gateway: gatewayAdapter, config: configAdapter }),
    stopGateway: () => stopGateway({ gateway: gatewayAdapter }),
    getGatewayState: () => getGatewayState({ gateway: gatewayAdapter }),
    subscribeGatewayState: (listener) => subscribeGatewayState({ gateway: gatewayAdapter }, listener),
    getConfig: () => getConfig({ config: configAdapter }),
    saveConfig: (config) => saveConfig({ config: configAdapter }, config),
    startRecording: (filename) => startRecording({ gateway: gatewayAdapter, recorder: recorderAdapter }, filename),
    stopRecording: () => stopRecording({ recorder: recorderAdapter }),
  };
}

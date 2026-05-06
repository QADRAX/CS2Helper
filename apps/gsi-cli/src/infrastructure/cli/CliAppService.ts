import type { GsiGatewayStartInfo } from "@cs2helper/gsi-gateway";
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
import { InMemoryGatewayAdapter } from "./adapters/InMemoryGatewayAdapter";
import type { CliConfig } from "../../domain/cli/config";

export interface CliApp {
  startGateway: () => Promise<GsiGatewayStartInfo>;
  stopGateway: () => Promise<void>;
  getGatewayState: () => Readonly<GsiProcessorState> | null;
  subscribeGatewayState: (listener: (state: Readonly<GsiProcessorState>) => void) => () => void;
  getConfig: () => Promise<CliConfig>;
  saveConfig: (config: Partial<CliConfig>) => Promise<CliConfig>;
  startRecording: (filename: string) => Promise<void>;
  stopRecording: () => Promise<void>;
}

/**
 * Composition root that assembles the CLI application using class-based adapters.
 * Implements the domain contract by delegating to standardized application use cases.
 */
export class CliAppService implements CliApp {
  private readonly gatewayPort: InMemoryGatewayAdapter;
  private readonly configPort: FileConfigAdapter;
  private readonly recorderPort: FileRecorderAdapter;

  constructor() {
    this.gatewayPort = new InMemoryGatewayAdapter();
    this.configPort = new FileConfigAdapter();
    this.recorderPort = new FileRecorderAdapter();
  }

  startGateway(): Promise<GsiGatewayStartInfo> {
    return startGateway({ gateway: this.gatewayPort, config: this.configPort });
  }

  stopGateway(): Promise<void> {
    return stopGateway({ gateway: this.gatewayPort });
  }

  getGatewayState(): Readonly<GsiProcessorState> | null {
    return getGatewayState({ gateway: this.gatewayPort });
  }

  subscribeGatewayState(listener: (state: Readonly<GsiProcessorState>) => void): () => void {
    return subscribeGatewayState({ gateway: this.gatewayPort }, listener);
  }

  getConfig(): Promise<CliConfig> {
    return getConfig({ config: this.configPort });
  }

  saveConfig(config: Partial<CliConfig>): Promise<CliConfig> {
    return saveConfig({ config: this.configPort }, config);
  }

  startRecording(filename: string): Promise<void> {
    return startRecording({ gateway: this.gatewayPort, recorder: this.recorderPort }, filename);
  }

  stopRecording(): Promise<void> {
    return stopRecording({ recorder: this.recorderPort });
  }
}

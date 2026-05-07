import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import { getConfig } from "../../application/cli/useCases/getConfig";
import { saveConfig } from "../../application/cli/useCases/saveConfig";
import { startGateway } from "../../application/cli/useCases/startGateway";
import { stopGateway } from "../../application/cli/useCases/stopGateway";
import { getGatewayState } from "../../application/cli/useCases/getGatewayState";
import { subscribeGatewayState } from "../../application/cli/useCases/subscribeGatewayState";
import { startRecording } from "../../application/cli/useCases/startRecording";
import { stopRecording } from "../../application/cli/useCases/stopRecording";
import { getCs2Status } from "../../application/cli/useCases/getCs2Status";
import {
  subscribeCs2Status,
  type SubscribeCs2StatusOptions,
} from "../../application/cli/useCases/subscribeCs2Status";
import {
  getSteamStatus,
  type SteamStatus,
} from "../../application/cli/useCases/getSteamStatus";
import {
  subscribeSteamStatus,
  type SubscribeSteamStatusOptions,
} from "../../application/cli/useCases/subscribeSteamStatus";
import { FileConfigAdapter } from "./adapters/FileConfigAdapter";
import { FileRecorderAdapter } from "./adapters/FileRecorderAdapter";
import { InMemoryGatewayAdapter } from "./adapters/InMemoryGatewayAdapter";
import { TasklistCs2ProcessAdapter } from "./adapters/TasklistCs2ProcessAdapter";
import { TasklistSteamProcessAdapter } from "./adapters/TasklistSteamProcessAdapter";
import { SteamRegistrySteamInstallAdapter } from "./adapters/SteamRegistrySteamInstallAdapter";
import type { CliConfig } from "../../domain/cli/config";
import type { GatewayStartInfo } from "../../application/cli/ports/GatewayPort";
import type { Cs2ProcessStatus } from "../../application/cli/ports/Cs2ProcessPort";

export interface CliApp {
  startGateway: () => Promise<GatewayStartInfo>;
  stopGateway: () => Promise<void>;
  getGatewayState: () => Readonly<GsiProcessorState> | null;
  subscribeGatewayState: (listener: (state: Readonly<GsiProcessorState>) => void) => () => void;
  getConfig: () => Promise<CliConfig>;
  saveConfig: (config: Partial<CliConfig>) => Promise<CliConfig>;
  startRecording: (filename: string) => Promise<void>;
  stopRecording: () => Promise<void>;
  getCs2Status: () => Promise<Cs2ProcessStatus>;
  subscribeCs2Status: (
    listener: (status: Cs2ProcessStatus) => void,
    options?: SubscribeCs2StatusOptions
  ) => () => void;
  getSteamStatus: () => Promise<SteamStatus>;
  subscribeSteamStatus: (
    listener: (status: SteamStatus) => void,
    options?: SubscribeSteamStatusOptions
  ) => () => void;
}

/**
 * Composition root that assembles the CLI application using class-based adapters.
 * Implements the domain contract by delegating to standardized application use cases.
 */
export class CliAppService implements CliApp {
  private readonly gatewayPort: InMemoryGatewayAdapter;
  private readonly configPort: FileConfigAdapter;
  private readonly recorderPort: FileRecorderAdapter;
  private readonly cs2ProcessPort: TasklistCs2ProcessAdapter;
  private readonly steamProcessPort: TasklistSteamProcessAdapter;
  private readonly steamInstallPort: SteamRegistrySteamInstallAdapter;

  constructor() {
    this.gatewayPort = new InMemoryGatewayAdapter();
    this.configPort = new FileConfigAdapter();
    this.recorderPort = new FileRecorderAdapter();
    this.cs2ProcessPort = new TasklistCs2ProcessAdapter();
    this.steamProcessPort = new TasklistSteamProcessAdapter();
    this.steamInstallPort = new SteamRegistrySteamInstallAdapter();
  }

  startGateway(): Promise<GatewayStartInfo> {
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

  getCs2Status(): Promise<Cs2ProcessStatus> {
    return getCs2Status({ cs2Process: this.cs2ProcessPort });
  }

  subscribeCs2Status(
    listener: (status: Cs2ProcessStatus) => void,
    options?: SubscribeCs2StatusOptions
  ): () => void {
    return subscribeCs2Status({ cs2Process: this.cs2ProcessPort }, listener, options);
  }

  getSteamStatus(): Promise<SteamStatus> {
    return getSteamStatus({
      steamInstall: this.steamInstallPort,
      steamProcess: this.steamProcessPort,
    });
  }

  subscribeSteamStatus(
    listener: (status: SteamStatus) => void,
    options?: SubscribeSteamStatusOptions
  ): () => void {
    return subscribeSteamStatus(
      {
        steamInstall: this.steamInstallPort,
        steamProcess: this.steamProcessPort,
      },
      listener,
      options
    );
  }
}

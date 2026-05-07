import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import { getConfig } from "../../application/cli/useCases/getConfig";
import {
  createOrUpdateGsiConfig,
  type CreateOrUpdateGsiConfigResult,
} from "../../application/cli/useCases/createOrUpdateGsiConfig";
import { saveConfig } from "../../application/cli/useCases/saveConfig";
import { launchCs2 } from "../../application/cli/useCases/launchCs2";
import { openDataFolder } from "../../application/cli/useCases/openDataFolder";
import { startGateway } from "../../application/cli/useCases/startGateway";
import { stopGateway } from "../../application/cli/useCases/stopGateway";
import { getGatewayDiagnostics } from "../../application/cli/useCases/getGatewayDiagnostics";
import {
  verifyGsiConfig,
  type VerifyGsiConfigResult,
} from "../../application/cli/useCases/verifyGsiConfig";
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
import { verifySteamWebApi as verifySteamWebApiUseCase } from "../../application/cli/useCases/verifySteamWebApi";
import type { ValidateSteamApiKeyOutcome } from "../../application/cli/ports/SteamWebApiClientPort";
import {
  subscribeSteamStatus,
  type SubscribeSteamStatusOptions,
} from "../../application/cli/useCases/subscribeSteamStatus";
import { FileConfigAdapter } from "./adapters/FileConfigAdapter";
import { FileRecorderAdapter } from "./adapters/FileRecorderAdapter";
import { FsGsiConfigFileAdapter } from "./adapters/FsGsiConfigFileAdapter";
import { InMemoryGatewayAdapter } from "./adapters/InMemoryGatewayAdapter";
import { SteamCs2LauncherAdapter } from "./adapters/SteamCs2LauncherAdapter";
import { SteamRegistryCs2LocatorAdapter } from "./adapters/SteamRegistryCs2LocatorAdapter";
import { TasklistCs2ProcessAdapter } from "./adapters/TasklistCs2ProcessAdapter";
import { TasklistSteamProcessAdapter } from "./adapters/TasklistSteamProcessAdapter";
import { SteamRegistrySteamInstallAdapter } from "./adapters/SteamRegistrySteamInstallAdapter";
import { SteamWebApiFetchAdapter } from "./adapters/SteamWebApiFetchAdapter";
import { WindowsDataFolderOpenerAdapter } from "./adapters/WindowsDataFolderOpenerAdapter";
import { readSteamWebApiKeyFromEnv } from "./steamWebApiEnv";
import type { CliConfig } from "../../domain/cli/config";
import type { GatewayStartInfo } from "../../application/cli/ports/GatewayPort";
import type { GatewayDiagnostics } from "../../application/cli/ports/GatewayPort";
import type { Cs2ProcessStatus } from "../../application/cli/ports/Cs2ProcessPort";

export interface CliApp {
  startGateway: () => Promise<GatewayStartInfo>;
  stopGateway: () => Promise<void>;
  getGatewayState: () => Readonly<GsiProcessorState> | null;
  getGatewayDiagnostics: () => Readonly<GatewayDiagnostics>;
  subscribeGatewayState: (listener: (state: Readonly<GsiProcessorState>) => void) => () => void;
  getConfig: () => Promise<CliConfig>;
  saveConfig: (config: Partial<CliConfig>) => Promise<CliConfig>;
  launchCs2: () => Promise<void>;
  openDataFolder: () => Promise<void>;
  verifyGsiConfig: () => Promise<VerifyGsiConfigResult>;
  createOrUpdateGsiConfig: () => Promise<CreateOrUpdateGsiConfigResult>;
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
  /** Validates `CS2HELPER_STEAM_WEB_API_KEY` against Steam Web API (no-op if absent). */
  verifySteamWebApi: () => Promise<ValidateSteamApiKeyOutcome>;
}

/**
 * Composition root that assembles the CLI application using class-based adapters.
 * Implements the domain contract by delegating to standardized application use cases.
 */
export class CliAppService implements CliApp {
  private readonly gatewayPort: InMemoryGatewayAdapter;
  private readonly configPort: FileConfigAdapter;
  private readonly recorderPort: FileRecorderAdapter;
  private readonly cs2InstallPort: SteamRegistryCs2LocatorAdapter;
  private readonly gsiConfigFilePort: FsGsiConfigFileAdapter;
  private readonly cs2LauncherPort: SteamCs2LauncherAdapter;
  private readonly dataFolderOpenerPort: WindowsDataFolderOpenerAdapter;
  private readonly cs2ProcessPort: TasklistCs2ProcessAdapter;
  private readonly steamProcessPort: TasklistSteamProcessAdapter;
  private readonly steamInstallPort: SteamRegistrySteamInstallAdapter;
  private readonly steamWebApiClient: SteamWebApiFetchAdapter;

  constructor() {
    this.gatewayPort = new InMemoryGatewayAdapter();
    this.configPort = new FileConfigAdapter();
    this.recorderPort = new FileRecorderAdapter();
    this.cs2InstallPort = new SteamRegistryCs2LocatorAdapter();
    this.gsiConfigFilePort = new FsGsiConfigFileAdapter();
    this.cs2LauncherPort = new SteamCs2LauncherAdapter();
    this.dataFolderOpenerPort = new WindowsDataFolderOpenerAdapter();
    this.cs2ProcessPort = new TasklistCs2ProcessAdapter();
    this.steamProcessPort = new TasklistSteamProcessAdapter();
    this.steamInstallPort = new SteamRegistrySteamInstallAdapter();
    this.steamWebApiClient = new SteamWebApiFetchAdapter();
  }

  startGateway(): Promise<GatewayStartInfo> {
    return startGateway({
      gateway: this.gatewayPort,
      config: this.configPort,
      cs2Install: this.cs2InstallPort,
      gsiConfigFile: this.gsiConfigFilePort,
      recorder: this.recorderPort,
    });
  }

  stopGateway(): Promise<void> {
    return stopGateway({ gateway: this.gatewayPort, recorder: this.recorderPort });
  }

  getGatewayState(): Readonly<GsiProcessorState> | null {
    return getGatewayState({ gateway: this.gatewayPort });
  }

  getGatewayDiagnostics(): Readonly<GatewayDiagnostics> {
    return getGatewayDiagnostics({ gateway: this.gatewayPort });
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

  launchCs2(): Promise<void> {
    return launchCs2({
      steamInstall: this.steamInstallPort,
      cs2Launcher: this.cs2LauncherPort,
    });
  }

  openDataFolder(): Promise<void> {
    return openDataFolder({
      folderOpener: this.dataFolderOpenerPort,
    });
  }

  verifyGsiConfig(): Promise<VerifyGsiConfigResult> {
    return verifyGsiConfig({
      config: this.configPort,
      cs2Install: this.cs2InstallPort,
      gsiConfigFile: this.gsiConfigFilePort,
    });
  }

  createOrUpdateGsiConfig(): Promise<CreateOrUpdateGsiConfigResult> {
    return createOrUpdateGsiConfig({
      config: this.configPort,
      cs2Install: this.cs2InstallPort,
      gsiConfigFile: this.gsiConfigFilePort,
    });
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

  verifySteamWebApi(): Promise<ValidateSteamApiKeyOutcome> {
    const key = readSteamWebApiKeyFromEnv();
    if (!key) return Promise.resolve({ ok: false, detail: "missing-key" });
    return verifySteamWebApiUseCase({ client: this.steamWebApiClient }, key);
  }
}

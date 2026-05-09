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
  subscribeCs2ProcessTracking,
  type SubscribeCs2ProcessTrackingOptions,
} from "../../application/cli/useCases/subscribeCs2ProcessTracking";
import {
  getSteamStatus,
  type SteamStatus,
} from "../../application/cli/useCases/getSteamStatus";
import { verifyEnvSteamWebApiKey } from "../../application/cli/useCases/verifyEnvSteamWebApiKey";
import { ensurePresentMonBootstrap } from "../../application/cli/useCases/ensurePresentMonBootstrap";
import type { PresentMonBootstrapOptions } from "../../application/cli/ports/PresentMonBootstrapPort";
import type { ValidateSteamApiKeyOutcome } from "../../application/cli/ports/SteamWebApiClientPort";
import {
  subscribeSteamStatus,
  type SubscribeSteamStatusOptions,
} from "../../application/cli/useCases/subscribeSteamStatus";
import { ManagedPresentMonBootstrapAdapter } from "./adapters/ManagedPresentMonBootstrapAdapter";
import { FileConfigAdapter } from "./adapters/FileConfigAdapter";
import { FileRecorderAdapter } from "./adapters/FileRecorderAdapter";
import { FsGsiConfigFileAdapter } from "./adapters/FsGsiConfigFileAdapter";
import { InMemoryGatewayAdapter } from "./adapters/InMemoryGatewayAdapter";
import { SteamCs2LauncherAdapter } from "./adapters/SteamCs2LauncherAdapter";
import { SteamRegistryCs2LocatorAdapter } from "./adapters/SteamRegistryCs2LocatorAdapter";
import { TasklistCs2ProcessAdapter } from "./adapters/TasklistCs2ProcessAdapter";
import {
  PresentMonPresentChainMetricsAdapter,
  WindowsCimOsProcessMetricsAdapter,
  WindowsCounterGpuProcessMetricsAdapter,
} from "./adapters/telemetry";
import { TasklistSteamProcessAdapter } from "./adapters/TasklistSteamProcessAdapter";
import { SteamRegistrySteamInstallAdapter } from "./adapters/SteamRegistrySteamInstallAdapter";
import { SteamWebApiFetchAdapter } from "./adapters/SteamWebApiFetchAdapter";
import { ProcessEnvSteamWebApiKeyAdapter } from "./adapters/ProcessEnvSteamWebApiKeyAdapter";
import { WindowsDataFolderOpenerAdapter } from "./adapters/WindowsDataFolderOpenerAdapter";
import type { CliConfig } from "../../domain/cli/config";
import type { GatewayStartInfo } from "../../application/cli/ports/GatewayPort";
import type { GatewayDiagnostics } from "../../application/cli/ports/GatewayPort";
import type { Cs2ProcessStatus, Cs2ProcessTrackingSnapshot } from "../../domain/telemetry/cs2Process";
import { withPorts, withPortsAsync } from "./withPorts";

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
  subscribeCs2ProcessTracking: (
    listener: (snapshot: Cs2ProcessTrackingSnapshot) => void,
    options?: SubscribeCs2ProcessTrackingOptions
  ) => () => void;
  getSteamStatus: () => Promise<SteamStatus>;
  subscribeSteamStatus: (
    listener: (status: SteamStatus) => void,
    options?: SubscribeSteamStatusOptions
  ) => () => void;
  /** Validates `CS2HELPER_STEAM_WEB_API_KEY` against Steam Web API (no-op if absent). */
  verifySteamWebApi: () => Promise<ValidateSteamApiKeyOutcome>;
  /**
   * Ensures managed PresentMon is available (download/update). When/how to call is decided by the UI layer.
   */
  ensurePresentMonBootstrap: (options?: PresentMonBootstrapOptions) => Promise<void>;
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
  private readonly osProcessMetricsPort: WindowsCimOsProcessMetricsAdapter;
  private readonly gpuProcessMetricsPort: WindowsCounterGpuProcessMetricsAdapter;
  private readonly presentMonBootstrap: ManagedPresentMonBootstrapAdapter;
  private readonly presentChainMetricsPort: PresentMonPresentChainMetricsAdapter;
  private readonly steamProcessPort: TasklistSteamProcessAdapter;
  private readonly steamInstallPort: SteamRegistrySteamInstallAdapter;
  private readonly steamWebApiKeySource: ProcessEnvSteamWebApiKeyAdapter;
  private readonly steamWebApiClient: SteamWebApiFetchAdapter;

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
  subscribeCs2ProcessTracking: (
    listener: (snapshot: Cs2ProcessTrackingSnapshot) => void,
    options?: SubscribeCs2ProcessTrackingOptions
  ) => () => void;
  getSteamStatus: () => Promise<SteamStatus>;
  subscribeSteamStatus: (
    listener: (status: SteamStatus) => void,
    options?: SubscribeSteamStatusOptions
  ) => () => void;
  verifySteamWebApi: () => Promise<ValidateSteamApiKeyOutcome>;
  ensurePresentMonBootstrap: (options?: PresentMonBootstrapOptions) => Promise<void>;

  constructor() {
    this.gatewayPort = new InMemoryGatewayAdapter();
    this.configPort = new FileConfigAdapter();
    this.recorderPort = new FileRecorderAdapter();
    this.cs2InstallPort = new SteamRegistryCs2LocatorAdapter();
    this.gsiConfigFilePort = new FsGsiConfigFileAdapter();
    this.cs2LauncherPort = new SteamCs2LauncherAdapter();
    this.dataFolderOpenerPort = new WindowsDataFolderOpenerAdapter();
    this.cs2ProcessPort = new TasklistCs2ProcessAdapter();
    this.osProcessMetricsPort = new WindowsCimOsProcessMetricsAdapter();
    this.gpuProcessMetricsPort = new WindowsCounterGpuProcessMetricsAdapter();
    this.presentMonBootstrap = new ManagedPresentMonBootstrapAdapter();
    this.presentChainMetricsPort = new PresentMonPresentChainMetricsAdapter();
    this.steamProcessPort = new TasklistSteamProcessAdapter();
    this.steamInstallPort = new SteamRegistrySteamInstallAdapter();
    this.steamWebApiKeySource = new ProcessEnvSteamWebApiKeyAdapter();
    this.steamWebApiClient = new SteamWebApiFetchAdapter();

    this.startGateway = withPortsAsync(startGateway, [
      this.gatewayPort,
      this.configPort,
      this.cs2InstallPort,
      this.gsiConfigFilePort,
      this.recorderPort,
    ]);
    this.stopGateway = withPortsAsync(stopGateway, [this.gatewayPort, this.recorderPort]);
    this.getGatewayState = withPorts(getGatewayState, [this.gatewayPort]);
    this.getGatewayDiagnostics = withPorts(getGatewayDiagnostics, [this.gatewayPort]);
    this.subscribeGatewayState = withPorts(subscribeGatewayState, [this.gatewayPort]);
    this.getConfig = withPortsAsync(getConfig, [this.configPort]);
    this.saveConfig = withPortsAsync(saveConfig, [this.configPort]);
    this.launchCs2 = withPortsAsync(launchCs2, [this.steamInstallPort, this.cs2LauncherPort]);
    this.openDataFolder = withPortsAsync(openDataFolder, [this.dataFolderOpenerPort]);
    this.verifyGsiConfig = withPortsAsync(verifyGsiConfig, [
      this.configPort,
      this.cs2InstallPort,
      this.gsiConfigFilePort,
    ]);
    this.createOrUpdateGsiConfig = withPortsAsync(createOrUpdateGsiConfig, [
      this.configPort,
      this.cs2InstallPort,
      this.gsiConfigFilePort,
    ]);
    this.startRecording = withPortsAsync(startRecording, [this.gatewayPort, this.recorderPort]);
    this.stopRecording = withPortsAsync(stopRecording, [this.recorderPort]);
    this.getCs2Status = withPortsAsync(getCs2Status, [this.cs2ProcessPort]);
    this.subscribeCs2ProcessTracking = withPorts(subscribeCs2ProcessTracking, [
      this.cs2ProcessPort,
      this.osProcessMetricsPort,
      this.gpuProcessMetricsPort,
      this.presentChainMetricsPort,
    ]);
    this.getSteamStatus = withPortsAsync(getSteamStatus, [
      this.steamInstallPort,
      this.steamProcessPort,
    ]);
    this.subscribeSteamStatus = withPorts(subscribeSteamStatus, [
      this.steamInstallPort,
      this.steamProcessPort,
    ]);
    this.verifySteamWebApi = withPortsAsync(verifyEnvSteamWebApiKey, [
      this.steamWebApiKeySource,
      this.steamWebApiClient,
    ]);
    this.ensurePresentMonBootstrap = withPortsAsync(ensurePresentMonBootstrap, [
      this.presentMonBootstrap,
    ]);
  }
}

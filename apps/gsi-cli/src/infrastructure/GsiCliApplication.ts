import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import {
  PerformanceProcessorService,
  type Cs2ProcessStatus,
  type Cs2ProcessTrackingPollOptions,
  type Cs2ProcessTrackingSnapshot,
  type PresentMonBootstrapOptions,
} from "@cs2helper/performance-processor";
import { getConfig } from "../application/useCases/getConfig";
import {
  createOrUpdateGsiConfig,
  type CreateOrUpdateGsiConfigResult,
} from "../application/useCases/createOrUpdateGsiConfig";
import { saveConfig } from "../application/useCases/saveConfig";
import { launchCs2 } from "../application/useCases/launchCs2";
import { openDataFolder } from "../application/useCases/openDataFolder";
import { startGateway } from "../application/useCases/startGateway";
import { stopGateway } from "../application/useCases/stopGateway";
import { getGatewayDiagnostics } from "../application/useCases/getGatewayDiagnostics";
import {
  verifyGsiConfig,
  type VerifyGsiConfigResult,
} from "../application/useCases/verifyGsiConfig";
import { getGatewayState } from "../application/useCases/getGatewayState";
import { subscribeGatewayState } from "../application/useCases/subscribeGatewayState";
import { startRecording } from "../application/useCases/startRecording";
import { stopRecording } from "../application/useCases/stopRecording";
import {
  getSteamStatus,
  type SteamStatus,
} from "../application/useCases/getSteamStatus";
import { verifyEnvSteamWebApiKey } from "../application/useCases/verifyEnvSteamWebApiKey";
import type { ValidateSteamApiKeyOutcome } from "../application/ports/SteamWebApiClientPort";
import {
  subscribeSteamStatus,
  type SubscribeSteamStatusOptions,
} from "../application/useCases/subscribeSteamStatus";
import type { CliApp } from "../application/CliApp";
import type { GatewayStartInfo } from "../application/ports/GatewayPort";
import type { GatewayDiagnostics } from "../application/ports/GatewayPort";
import type { CliConfig } from "../domain/cli/config";
import { withPorts, withPortsAsync } from "@cs2helper/shared";
import { CliAppService } from "./CliAppService";
import { FileConfigAdapter } from "./adapters/FileConfigAdapter";
import { FileRecorderAdapter } from "./adapters/FileRecorderAdapter";
import { FsGsiConfigFileAdapter } from "./adapters/FsGsiConfigFileAdapter";
import { InMemoryGatewayAdapter } from "./adapters/InMemoryGatewayAdapter";
import { SteamCs2LauncherAdapter } from "./adapters/SteamCs2LauncherAdapter";
import { SteamRegistryCs2LocatorAdapter } from "./adapters/SteamRegistryCs2LocatorAdapter";
import { TasklistSteamProcessAdapter } from "./adapters/TasklistSteamProcessAdapter";
import { SteamRegistrySteamInstallAdapter } from "./adapters/SteamRegistrySteamInstallAdapter";
import { SteamWebApiFetchAdapter } from "./adapters/SteamWebApiFetchAdapter";
import { ProcessEnvSteamWebApiKeyAdapter } from "./adapters/ProcessEnvSteamWebApiKeyAdapter";
import { WindowsDataFolderOpenerAdapter } from "./adapters/WindowsDataFolderOpenerAdapter";

/**
 * Composition root: wires application use cases to infrastructure adapters (incl. {@link CliAppService} for PowerShell).
 */
export class GsiCliApplication implements CliApp {
  private readonly gatewayPort: InMemoryGatewayAdapter;
  private readonly configPort: FileConfigAdapter;
  private readonly recorderPort: FileRecorderAdapter;
  private readonly cs2InstallPort: SteamRegistryCs2LocatorAdapter;
  private readonly gsiConfigFilePort: FsGsiConfigFileAdapter;
  private readonly cs2LauncherPort: SteamCs2LauncherAdapter;
  private readonly dataFolderOpenerPort: WindowsDataFolderOpenerAdapter;
  private readonly performance: PerformanceProcessorService;
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
    options?: Cs2ProcessTrackingPollOptions
  ) => () => void;
  getSteamStatus: () => Promise<SteamStatus>;
  subscribeSteamStatus: (
    listener: (status: SteamStatus) => void,
    options?: SubscribeSteamStatusOptions
  ) => () => void;
  verifySteamWebApi: () => Promise<ValidateSteamApiKeyOutcome>;
  ensurePresentMonBootstrap: (options?: PresentMonBootstrapOptions) => Promise<void>;

  constructor() {
    const powershell = new CliAppService();

    this.gatewayPort = new InMemoryGatewayAdapter();
    this.configPort = new FileConfigAdapter();
    this.recorderPort = new FileRecorderAdapter();
    this.cs2InstallPort = new SteamRegistryCs2LocatorAdapter();
    this.gsiConfigFilePort = new FsGsiConfigFileAdapter();
    this.cs2LauncherPort = new SteamCs2LauncherAdapter();
    this.dataFolderOpenerPort = new WindowsDataFolderOpenerAdapter();
    this.performance = new PerformanceProcessorService({ powershell });
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
    this.getCs2Status = this.performance.getCs2Status.bind(this.performance);
    this.subscribeCs2ProcessTracking = this.performance.subscribeCs2ProcessTracking.bind(
      this.performance
    );
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
    this.ensurePresentMonBootstrap = this.performance.ensurePresentMonBootstrap.bind(
      this.performance
    );
  }
}

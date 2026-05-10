import { Cs2ClientListenerService } from "@cs2helper/cs2-client-listener";
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
import {
  verifyGsiConfig,
  type VerifyGsiConfigResult,
} from "../application/useCases/verifyGsiConfig";
import { startRecording } from "../application/useCases/startRecording";
import { stopRecording } from "../application/useCases/stopRecording";
import {
  getSteamStatus,
  type SteamStatus,
} from "../application/useCases/getSteamStatus";
import { verifyEnvSteamWebApiKey } from "../application/useCases/verifyEnvSteamWebApiKey";
import type { ValidateSteamApiKeyOutcome } from "../application/ports/SteamWebApiClientPort";
import {
  subscribeCs2ProcessStatus,
  type SubscribeCs2ProcessStatusOptions,
} from "../application/useCases/subscribeCs2ProcessStatus";
import {
  subscribeSteamStatus,
  type SubscribeSteamStatusOptions,
} from "../application/useCases/subscribeSteamStatus";
import type { CliApp } from "../application/CliApp";
import type { GatewayStartInfo } from "../application/ports/GatewayPort";
import type { GatewayDiagnostics } from "../application/ports/GatewayPort";
import type { CliConfig } from "../domain/cli/config";
import type { Cs2ProcessStatus } from "@cs2helper/performance-processor";
import { withPorts, withPortsAsync } from "@cs2helper/shared";
import { CliAppService } from "./CliAppService";
import { Cs2ClientListenerCliAdapter } from "./adapters/Cs2ClientListenerCliAdapter";
import { FileConfigAdapter } from "./adapters/FileConfigAdapter";
import { FsGsiConfigFileAdapter } from "./adapters/FsGsiConfigFileAdapter";
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
  private readonly listener: Cs2ClientListenerService;
  private readonly listenerCli: Cs2ClientListenerCliAdapter;
  private readonly configPort: FileConfigAdapter;
  private readonly cs2InstallPort: SteamRegistryCs2LocatorAdapter;
  private readonly gsiConfigFilePort: FsGsiConfigFileAdapter;
  private readonly cs2LauncherPort: SteamCs2LauncherAdapter;
  private readonly dataFolderOpenerPort: WindowsDataFolderOpenerAdapter;
  private readonly steamProcessPort: TasklistSteamProcessAdapter;
  private readonly steamInstallPort: SteamRegistrySteamInstallAdapter;
  private readonly steamWebApiKeySource: ProcessEnvSteamWebApiKeyAdapter;
  private readonly steamWebApiClient: SteamWebApiFetchAdapter;

  startGateway: () => Promise<GatewayStartInfo>;
  stopGateway: () => Promise<void>;
  getGatewayDiagnostics: () => Readonly<GatewayDiagnostics>;
  subscribeTickFrames: CliApp["subscribeTickFrames"];
  getConfig: () => Promise<CliConfig>;
  saveConfig: (config: Partial<CliConfig>) => Promise<CliConfig>;
  launchCs2: () => Promise<void>;
  openDataFolder: () => Promise<void>;
  verifyGsiConfig: () => Promise<VerifyGsiConfigResult>;
  createOrUpdateGsiConfig: () => Promise<CreateOrUpdateGsiConfigResult>;
  startRecording: (filename: string) => Promise<void>;
  stopRecording: () => Promise<void>;
  getSteamStatus: () => Promise<SteamStatus>;
  subscribeSteamStatus: (
    listener: (status: SteamStatus) => void,
    options?: SubscribeSteamStatusOptions
  ) => () => void;
  subscribeCs2ProcessStatus: (
    listener: (status: Cs2ProcessStatus) => void,
    options?: SubscribeCs2ProcessStatusOptions
  ) => () => void;
  verifySteamWebApi: () => Promise<ValidateSteamApiKeyOutcome>;
  ensurePresentMonBootstrap: CliApp["ensurePresentMonBootstrap"];

  constructor() {
    const powershell = new CliAppService();

    this.listener = new Cs2ClientListenerService(powershell);
    this.listenerCli = new Cs2ClientListenerCliAdapter(this.listener);
    this.configPort = new FileConfigAdapter();
    this.cs2InstallPort = new SteamRegistryCs2LocatorAdapter();
    this.gsiConfigFilePort = new FsGsiConfigFileAdapter();
    this.cs2LauncherPort = new SteamCs2LauncherAdapter();
    this.dataFolderOpenerPort = new WindowsDataFolderOpenerAdapter();
    this.steamProcessPort = new TasklistSteamProcessAdapter();
    this.steamInstallPort = new SteamRegistrySteamInstallAdapter();
    this.steamWebApiKeySource = new ProcessEnvSteamWebApiKeyAdapter();
    this.steamWebApiClient = new SteamWebApiFetchAdapter();

    this.startGateway = withPortsAsync(startGateway, [
      this.listenerCli,
      this.configPort,
      this.cs2InstallPort,
      this.gsiConfigFilePort,
    ]);
    this.stopGateway = withPortsAsync(stopGateway, [this.listenerCli]);
    this.getGatewayDiagnostics = () => this.listener.getGatewayDiagnostics();
    this.subscribeTickFrames = (listener) => this.listener.subscribeTickFrames(listener);
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
    this.startRecording = withPortsAsync(startRecording, [this.listenerCli]);
    this.stopRecording = withPortsAsync(stopRecording, [this.listenerCli]);
    this.getSteamStatus = withPortsAsync(getSteamStatus, [
      this.steamInstallPort,
      this.steamProcessPort,
    ]);
    this.subscribeSteamStatus = withPorts(subscribeSteamStatus, [
      this.steamInstallPort,
      this.steamProcessPort,
    ]);
    this.subscribeCs2ProcessStatus = withPorts(subscribeCs2ProcessStatus, [this.listenerCli]);
    this.verifySteamWebApi = withPortsAsync(verifyEnvSteamWebApiKey, [
      this.steamWebApiKeySource,
      this.steamWebApiClient,
    ]);
    this.ensurePresentMonBootstrap = (options) => this.listener.ensurePresentMonBootstrap(options);
  }
}

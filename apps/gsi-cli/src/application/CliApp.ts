import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type {
  Cs2ProcessStatus,
  Cs2ProcessTrackingPollOptions,
  Cs2ProcessTrackingSnapshot,
  PresentMonBootstrapOptions,
} from "@cs2helper/performance-processor";
import type { CreateOrUpdateGsiConfigResult } from "./useCases/createOrUpdateGsiConfig";
import type { VerifyGsiConfigResult } from "./useCases/verifyGsiConfig";
import type { SteamStatus } from "./useCases/getSteamStatus";
import type { SubscribeSteamStatusOptions } from "./useCases/subscribeSteamStatus";
import type { ValidateSteamApiKeyOutcome } from "./ports/SteamWebApiClientPort";
import type { GatewayStartInfo, GatewayDiagnostics } from "./ports/GatewayPort";
import type { CliConfig } from "../domain/cli/config";

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
    options?: Cs2ProcessTrackingPollOptions
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

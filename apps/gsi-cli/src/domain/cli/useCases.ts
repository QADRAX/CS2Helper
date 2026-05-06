import type { UseCase } from "@cs2helper/shared";
import type { GsiGatewayStartInfo } from "@cs2helper/gsi-gateway";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { CliConfig } from "./config.js";

export type StartGatewayUseCase = UseCase<[], Promise<GsiGatewayStartInfo>>;
export type StopGatewayUseCase = UseCase<[], Promise<void>>;
export type GetGatewayStateUseCase = UseCase<[], Readonly<GsiProcessorState> | null>;
export type SubscribeGatewayStateUseCase = UseCase<
  [listener: (state: Readonly<GsiProcessorState>) => void],
  () => void
>;

export type GetConfigUseCase = UseCase<[], Promise<CliConfig>>;
export type SaveConfigUseCase = UseCase<[config: Partial<CliConfig>], Promise<CliConfig>>;


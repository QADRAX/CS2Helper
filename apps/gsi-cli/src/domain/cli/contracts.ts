import type { GsiGatewayService } from "@cs2helper/gsi-gateway";
import type { CliConfig } from "./config.js";

export interface ConfigStore {
  getConfig: () => Promise<CliConfig>;
  saveConfig: (config: CliConfig) => Promise<void>;
}

export interface CliGatewayManager {
  getGateway: () => GsiGatewayService | null;
  setGateway: (gateway: GsiGatewayService | null) => void;
}

export interface CliGatewayContext {
  gatewayManager: CliGatewayManager;
  configStore: ConfigStore;
}

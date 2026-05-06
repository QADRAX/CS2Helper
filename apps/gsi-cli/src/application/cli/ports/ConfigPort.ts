import type { CliConfig } from "../../../domain/cli/config";

export interface ConfigPort {
  getConfig: () => Promise<CliConfig>;
  saveConfig: (config: CliConfig) => Promise<void>;
}

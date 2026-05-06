import fs from "fs/promises";
import path from "path";
import type { CliConfig } from "../../domain/cli/config.js";
import type { ConfigStore } from "../../domain/cli/contracts.js";

const CONFIG_FILE_PATH = path.join(process.cwd(), "gsi-cli.config.json");

export function createFileConfigStore(): ConfigStore {
  return {
    async getConfig() {
      try {
        const data = await fs.readFile(CONFIG_FILE_PATH, "utf-8");
        return JSON.parse(data) as CliConfig;
      } catch (error: any) {
        if (error.code === "ENOENT") {
          return {}; // Return empty config if file doesn't exist
        }
        throw error;
      }
    },
    async saveConfig(config: CliConfig) {
      await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), "utf-8");
    },
  };
}

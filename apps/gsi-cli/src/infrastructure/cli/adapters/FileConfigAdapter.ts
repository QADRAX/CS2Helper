import fs from "fs/promises";
import path from "path";
import type { CliConfig } from "../../../domain/cli/config";
import type { ConfigPort } from "../../../application/cli/ports/ConfigPort";

export class FileConfigAdapter implements ConfigPort {
  private readonly configPath = path.join(process.cwd(), "gsi-cli.config.json");

  async getConfig(): Promise<CliConfig> {
    try {
      const data = await fs.readFile(this.configPath, "utf-8");
      return JSON.parse(data) as CliConfig;
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return {}; // Return empty config if file doesn't exist
      }
      throw error;
    }
  }

  async saveConfig(config: CliConfig): Promise<void> {
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), "utf-8");
  }
}

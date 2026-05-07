import fs from "fs/promises";
import path from "path";
import {
  DEFAULT_CLI_CONFIG,
  normalizeCliConfig,
  type CliConfig,
} from "../../../domain/cli/config";
import type { ConfigPort } from "../../../application/cli/ports/ConfigPort";

export class FileConfigAdapter implements ConfigPort {
  private readonly configPath: string;
  private readonly legacyConfigPaths: string[];

  constructor() {
    const appDataRoot = process.env.APPDATA || process.cwd();
    this.configPath = path.join(appDataRoot, "CS2Helper", "gsi-cli", "config.json");
    this.legacyConfigPaths = [
      path.join(process.cwd(), "gsi-cli.config.json"),
      path.join(process.cwd(), "apps", "gsi-cli", "gsi-cli.config.json"),
    ];
  }

  async getConfig(): Promise<CliConfig> {
    const appDataConfig = await this.tryReadConfig(this.configPath);
    if (appDataConfig) {
      const normalized = normalizeCliConfig(appDataConfig);
      await this.saveConfig(normalized);
      return normalized;
    }

    const migrated = await this.tryMigrateLegacyConfig();
    if (migrated) {
      return migrated;
    }

    await this.saveConfig(DEFAULT_CLI_CONFIG);
    return { ...DEFAULT_CLI_CONFIG };
  }

  async saveConfig(config: CliConfig): Promise<void> {
    const normalized = normalizeCliConfig(config);
    await fs.mkdir(path.dirname(this.configPath), { recursive: true });
    await fs.writeFile(this.configPath, JSON.stringify(normalized, null, 2), "utf-8");
  }

  private async tryReadConfig(targetPath: string): Promise<unknown | null> {
    try {
      const data = await fs.readFile(targetPath, "utf-8");
      return JSON.parse(data) as unknown;
    } catch (error) {
      if (isNotFound(error)) {
        return null;
      }
      throw error;
    }
  }

  private async tryMigrateLegacyConfig(): Promise<CliConfig | null> {
    for (const legacyPath of this.legacyConfigPaths) {
      const raw = await this.tryReadConfig(legacyPath);
      if (!raw) continue;

      const normalized = normalizeCliConfig(raw);
      await this.saveConfig(normalized);
      await this.deleteIfExists(legacyPath);
      return normalized;
    }
    return null;
  }

  private async deleteIfExists(targetPath: string): Promise<void> {
    try {
      await fs.unlink(targetPath);
    } catch (error) {
      if (!isNotFound(error)) throw error;
    }
  }
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ENOENT"
  );
}

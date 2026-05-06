import type { ConfigPort } from "../ports/ConfigPort";
import type { CliConfig } from "../../../domain/cli/config";

export const saveConfig = async (configPort: ConfigPort, configUpdate: Partial<CliConfig>) => {
  const current = await configPort.getConfig();
  const updated = { ...current, ...configUpdate };
  await configPort.saveConfig(updated);
  return updated;
};

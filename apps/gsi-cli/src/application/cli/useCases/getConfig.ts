import type { ConfigPort } from "../ports/ConfigPort";

export const getConfig = async (configPort: ConfigPort) => {
  return await configPort.getConfig();
};

import {
  DEFAULT_GSI_PATH,
  type HttpServerConfig,
} from "../../../domain/gsiGateway/httpContracts";

/**
 * Resolves HTTP config defaults for the local gateway listener.
 */
export function createDefaultHttpConfig(
  override: Partial<HttpServerConfig> = {}
): HttpServerConfig {
  return {
    host: override.host ?? "127.0.0.1",
    port: override.port ?? 3000,
    gsiPath: override.gsiPath ?? DEFAULT_GSI_PATH,
    maxBodyBytes: override.maxBodyBytes ?? 1024 * 1024,
  };
}

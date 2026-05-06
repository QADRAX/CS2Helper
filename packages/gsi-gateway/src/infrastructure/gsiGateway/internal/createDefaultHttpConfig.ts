import type { HttpServerConfig } from "../../../domain/gsiGateway/httpContracts";

/**
 * Resolves HTTP config defaults for the local gateway listener.
 */
export function createDefaultHttpConfig(
  override: Partial<HttpServerConfig> = {}
): HttpServerConfig {
  return {
    port: override.port ?? 3000,
  };
}

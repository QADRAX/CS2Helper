import type { GsiGatewayOptions } from "../../domain";
import type { HttpServerConfig } from "../../domain/httpContracts";

/**
 * Creates the default configuration for the HTTP gateway.
 * Port is configurable, but path is fixed for simplicity.
 */
export function createDefaultHttpConfig(options: GsiGatewayOptions = {}): HttpServerConfig {
  return {
    port: options.port ?? 3001,
  };
}

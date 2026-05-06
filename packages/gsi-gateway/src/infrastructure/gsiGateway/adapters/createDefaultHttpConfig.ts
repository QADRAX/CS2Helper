import type { CreateGsiGatewayServiceOptions } from "../../../domain/gsiGateway";
import type { HttpServerConfig } from "../../../domain/gsiGateway/httpContracts";

/**
 * Creates the default configuration for the HTTP gateway.
 * Port is configurable, but path is fixed for simplicity.
 */
export function createDefaultHttpConfig(
  options: CreateGsiGatewayServiceOptions = {}
): HttpServerConfig {
  return {
    port: options.port ?? 3001,
  };
}

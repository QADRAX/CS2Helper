/**
 * @packageDocumentation
 * Node HTTP gateway that ingests CS2 GSI ticks.
 */

export { GsiGatewayService } from "./infrastructure/gsiGateway/GsiGatewayService";
export type {
  GsiGatewayOptions,
  GsiGateway,
  GsiGatewayStartInfo,
} from "./domain/gsiGateway/serviceContracts";

export type * from "./domain/gsiGateway";

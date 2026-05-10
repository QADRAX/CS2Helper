/**
 * @packageDocumentation
 * Node HTTP gateway that ingests CS2 GSI ticks.
 */

export { GsiGatewayService } from "./infrastructure/GsiGatewayService";
export type {
  GsiGatewayOptions,
  GsiGateway,
  GsiGatewayStartInfo,
} from "./domain/serviceContracts";

export type * from "./domain";

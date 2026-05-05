/**
 * @packageDocumentation
 * Node HTTP gateway that ingests CS2 GSI ticks and wraps @cs2helper/gsi-processor.
 */

export { createGsiGatewayService } from "./infrastructure/gsiGateway/createGsiGatewayService";
export type {
  CreateGsiGatewayServiceOptions,
  GsiGatewayService,
} from "./domain/gsiGateway/serviceContracts";

export type * from "./domain/gsiGateway";

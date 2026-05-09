import type { UseCase } from "@cs2helper/shared";
import type { GatewayDiagnostics, GatewayPort } from "../ports/GatewayPort";

/**
 * Ports tuple order: `[gateway]`.
 */
export const getGatewayDiagnostics: UseCase<
  [GatewayPort],
  [],
  Readonly<GatewayDiagnostics>
> = ([gateway]) => gateway.getDiagnostics();

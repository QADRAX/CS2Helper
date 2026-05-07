import type { UseCase } from "@cs2helper/shared";
import type { GatewayDiagnostics, GatewayPort } from "../ports/GatewayPort";

export interface GetGatewayDiagnosticsPorts {
  gateway: GatewayPort;
}

export const getGatewayDiagnostics: UseCase<
  GetGatewayDiagnosticsPorts,
  [],
  Readonly<GatewayDiagnostics>
> = ({ gateway }) => gateway.getDiagnostics();

/** Address metadata returned once the listener HTTP gateway starts listening. */
export interface GatewayStartInfo {
  port: number;
  gsiWarning?: string;
}

export interface GatewayDiagnostics {
  receivedRequests: number;
  rejectedRequests: number;
  lastRejectReason?: string;
}

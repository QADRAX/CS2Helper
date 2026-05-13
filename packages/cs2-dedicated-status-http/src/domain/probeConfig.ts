/** TCP readiness probe options for the `ready` field on `GET /`. */
export type ReadyProbeConfig = {
  gamePort: number;
  tcpProbe: boolean;
};

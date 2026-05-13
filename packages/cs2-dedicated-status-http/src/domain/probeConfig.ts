/** TCP readiness probe options for /ready and /status. */
export type ReadyProbeConfig = {
  gamePort: number;
  tcpProbe: boolean;
};

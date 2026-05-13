export interface TcpProbePort {
  probe(host: string, port: number, timeoutMs: number): Promise<boolean>;
}

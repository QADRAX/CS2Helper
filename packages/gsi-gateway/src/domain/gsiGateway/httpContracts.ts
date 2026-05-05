/** Default HTTP path expected by CS2 GSI configuration. */
export const DEFAULT_GSI_PATH = "/gsi";

/** Runtime HTTP server configuration for the gateway listener. */
export interface HttpServerConfig {
  host: string;
  port: number;
  gsiPath: string;
  maxBodyBytes: number;
}

/** Materialized network address after binding the HTTP server. */
export interface HttpListenAddress {
  host: string;
  port: number;
}

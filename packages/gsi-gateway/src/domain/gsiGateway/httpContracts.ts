/** Runtime HTTP server configuration for the gateway listener. */
export interface HttpServerConfig {
  port: number;
}

/** Materialized network address after binding the HTTP server. */
export interface HttpListenAddress {
  port: number;
}

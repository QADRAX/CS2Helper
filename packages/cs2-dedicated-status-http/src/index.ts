/**
 * @packageDocumentation
 * HTTP sidecar for CS2 dedicated: `GET /` state, `GET /events` (SSE), `POST /update`, optional Basic auth, install + game orchestration.
 */

export * from "./domain";
export * from "./application";
export { createStatusHttpServer } from "./infrastructure/StatusHttpServer";
export type { StatusHttpServerOptions } from "./infrastructure/StatusHttpServer";

/** Port for subscribing to raw GSI HTTP bodies (JSON strings). */
export interface RawTicksSubscriptionPort {
  subscribe: (listener: (raw: string) => void) => () => void;
}

/** Port invoked by the HTTP ingestion path to fan out one raw body to subscribers. */
export interface RawTickDispatchPort {
  dispatchRawTick: (raw: string) => void;
}

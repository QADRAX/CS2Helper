/**
 * Payload emitted by the **master** clock (HTTP webhook, timer, manual trigger, …).
 * The hub assigns monotonic `sequence` and default wall time unless `receivedAtMs` is set.
 */
export interface MasterTickSignal {
  readonly data: unknown;
  /** When omitted, the hub uses `Date.now()` when the signal is processed. */
  readonly receivedAtMs?: number;
}

/**
 * Subscribes to the authoritative tick stream. Each notification should mean “sample all sources now”.
 */
export interface MasterClockPort {
  subscribe(listener: (signal: MasterTickSignal) => void): () => void;
}

/** Version baked into each {@link TickFrame} for replay / migrations. */
export const TICK_HUB_SCHEMA_VERSION = 1;

/** Stable id for a {@link TickSourcePort} (e.g. `performance`, `keyboard`). */
export type TickSourceId = string;

/** When a source fails or times out, the hub stores this shape under `sources[id]`. */
export interface TickSourceErrorPayload {
  readonly error: string;
}

/**
 * One aligned snapshot: `master` is whatever the host attached to the master clock signal;
 * `sources` holds parallel captures keyed by {@link TickSourceId}.
 */
export interface TickFrame {
  readonly schemaVersion: number;
  readonly sequence: number;
  readonly receivedAtMs: number;
  readonly master: unknown;
  readonly sources: Record<string, unknown>;
}

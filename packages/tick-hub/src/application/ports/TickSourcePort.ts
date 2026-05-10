import type { TickSourceId } from "../../domain";

/** Context passed to every {@link TickSourcePort.captureOnTick}. */
export interface TickCaptureContext {
  readonly sequence: number;
  readonly receivedAtMs: number;
  /** Same value as {@link TickFrame.master} for this tick. */
  readonly master: unknown;
}

/**
 * Optional data source (polling backend, ETW, mic level, …) invoked on each master tick.
 */
export interface TickSourcePort {
  readonly id: TickSourceId;
  captureOnTick(ctx: TickCaptureContext): Promise<unknown>;
}

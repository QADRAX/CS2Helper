import {
  TICK_HUB_SCHEMA_VERSION,
  type TickFrame,
  type TickSourceErrorPayload,
} from "../../domain";
import type { MasterTickSignal } from "../ports/MasterClockPort";
import type { TickCaptureContext, TickSourcePort } from "../ports/TickSourcePort";

export interface AssembleTickFrameOptions {
  /** Per-source wall timeout for `captureOnTick` (default 500 ms). */
  sourceTimeoutMs?: number;
}

function isDefinedNonNull(value: unknown): boolean {
  return value !== undefined && value !== null;
}

/**
 * Builds a {@link TickFrame}: `master` comes from the signal; `sources` from each {@link TickSourcePort}.
 */
export async function assembleTickFrame(
  signal: MasterTickSignal,
  tickMeta: Pick<TickCaptureContext, "sequence" | "receivedAtMs">,
  sources: readonly TickSourcePort[],
  options?: AssembleTickFrameOptions
): Promise<TickFrame> {
  const timeoutMs = options?.sourceTimeoutMs ?? 500;
  const master = signal.data;
  const ctx: TickCaptureContext = {
    sequence: tickMeta.sequence,
    receivedAtMs: tickMeta.receivedAtMs,
    master,
  };
  const out: Record<string, unknown> = {};

  await Promise.all(
    sources.map(async (source) => {
      try {
        const value = await Promise.race([
          source.captureOnTick(ctx),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error("source timeout")), timeoutMs);
          }),
        ]);
        if (isDefinedNonNull(value)) {
          out[source.id] = value;
        }
      } catch (err) {
        const payload: TickSourceErrorPayload = {
          error: err instanceof Error ? err.message : String(err),
        };
        out[source.id] = payload;
      }
    })
  );

  return {
    schemaVersion: TICK_HUB_SCHEMA_VERSION,
    sequence: tickMeta.sequence,
    receivedAtMs: tickMeta.receivedAtMs,
    master,
    sources: out,
  };
}

import type { Cs2ProcessTrackingSnapshot } from "@cs2helper/performance-processor";
import type { TickFrame, TickSourceErrorPayload } from "@cs2helper/tick-hub";

function isTickSourceErrorPayload(v: unknown): v is TickSourceErrorPayload {
  return (
    typeof v === "object" &&
    v !== null &&
    "error" in v &&
    typeof (v as TickSourceErrorPayload).error === "string"
  );
}

/**
 * Reads `tickFrame.sources.performance` when it looks like a
 * {@link Cs2ProcessTrackingSnapshot}; otherwise `null`.
 */
export function parseTickPerformanceSnapshot(frame: TickFrame | null): Cs2ProcessTrackingSnapshot | null {
  if (frame == null) {
    return null;
  }
  const raw = frame.sources["performance"];
  if (raw == null || isTickSourceErrorPayload(raw)) {
    return null;
  }
  if (typeof raw !== "object" || !("running" in raw) || typeof (raw as { running?: unknown }).running !== "boolean") {
    return null;
  }
  return raw as Cs2ProcessTrackingSnapshot;
}

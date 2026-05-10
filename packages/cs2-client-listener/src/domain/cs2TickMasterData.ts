import type { GsiGatewayDiagnostics } from "@cs2helper/gsi-gateway";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";

/**
 * Shape of {@link TickFrame.master} when using {@link Cs2ClientListenerService}
 * (one raw GSI POST after processor ingest).
 */
export interface Cs2TickMasterData {
  readonly state: Readonly<GsiProcessorState>;
  readonly raw: string;
  /** HTTP ingest counters at the same instant as `state` (omitted in older JSONL replays). */
  readonly gatewayDiagnostics?: Readonly<GsiGatewayDiagnostics>;
}

export function isCs2TickMasterData(value: unknown): value is Cs2TickMasterData {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const o = value as Record<string, unknown>;
  return typeof o.raw === "string" && o.state !== undefined && typeof o.state === "object";
}

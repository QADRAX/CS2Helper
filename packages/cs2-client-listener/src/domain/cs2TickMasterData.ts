import type { GsiProcessorState } from "@cs2helper/gsi-processor";

/**
 * Shape of {@link TickFrame.master} when using {@link Cs2ClientListenerService}
 * (one raw GSI POST after processor ingest).
 */
export interface Cs2TickMasterData {
  readonly state: Readonly<GsiProcessorState>;
  readonly raw: string;
}

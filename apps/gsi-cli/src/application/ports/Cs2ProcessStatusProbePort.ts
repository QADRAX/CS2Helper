import type { Cs2ProcessStatus } from "@cs2helper/performance-processor";

/** Minimal port for polling CS2 process presence (e.g. tasklist). */
export interface Cs2ProcessStatusProbePort {
  getCs2ProcessStatus(): Promise<Cs2ProcessStatus>;
}

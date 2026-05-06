import type { GsiProcessorState } from "@cs2helper/gsi-processor";

export type CliStatus = "IDLE" | "LISTENING" | "ERROR";

export interface CliState {
  status: CliStatus;
  errorMessage?: string;
  gsiState?: Readonly<GsiProcessorState> | null;
  port?: number;
}

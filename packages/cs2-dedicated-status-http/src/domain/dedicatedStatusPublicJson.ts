import type { DedicatedStatusPhase } from "./statusPhase";
import type { SteamProgressSnapshot } from "./steamProgress";

/** JSON body for `GET /` (CS dedicated state only). */
export type DedicatedStatusPublicJson = {
  phase: DedicatedStatusPhase;
  updating: boolean;
  operationInProgress: boolean;
  ready: boolean;
  lastUpdateError: string | null;
  childPid: number | null;
  updateProgress: SteamProgressSnapshot | null;
};

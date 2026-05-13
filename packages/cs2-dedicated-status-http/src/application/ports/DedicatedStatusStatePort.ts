import type { DedicatedStatusPhase } from "../../domain/statusPhase";
import type { SteamProgressState } from "../../domain/steamProgress";

export type DedicatedStatusReadModel = {
  phase: DedicatedStatusPhase;
  lastUpdateError: string | null;
  opsLocked: boolean;
  updateProgress: SteamProgressState | null;
};

/**
 * Mutable runtime used by install / HTTP read model (implemented in infrastructure).
 */
export interface DedicatedStatusStatePort {
  snapshot(): DedicatedStatusReadModel;
  setPhase(phase: DedicatedStatusPhase): void;
  setLastUpdateError(message: string | null): void;
  setOpsLocked(locked: boolean): void;
  setUpdateProgress(progress: SteamProgressState | null): void;
}

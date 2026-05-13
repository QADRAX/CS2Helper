import type {
  DedicatedStatusReadModel,
  DedicatedStatusStatePort,
} from "../../application/ports/DedicatedStatusStatePort";
import type { DedicatedStatusPhase } from "../../domain/statusPhase";
import type { SteamProgressState } from "../../domain/steamProgress";

export class InMemoryDedicatedStatusState implements DedicatedStatusStatePort {
  phase: DedicatedStatusPhase = "boot";
  lastUpdateError: string | null = null;
  opsLocked = true;
  updateProgress: SteamProgressState | null = null;

  snapshot(): DedicatedStatusReadModel {
    return {
      phase: this.phase,
      lastUpdateError: this.lastUpdateError,
      opsLocked: this.opsLocked,
      updateProgress: this.updateProgress,
    };
  }

  setPhase(phase: DedicatedStatusPhase): void {
    this.phase = phase;
  }

  setLastUpdateError(message: string | null): void {
    this.lastUpdateError = message;
  }

  setOpsLocked(locked: boolean): void {
    this.opsLocked = locked;
  }

  setUpdateProgress(progress: SteamProgressState | null): void {
    this.updateProgress = progress;
  }
}

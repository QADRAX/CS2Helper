import type {
  GsiRecordFile,
  ReplayPlaybackSession,
  ReplayResult,
  ReplaySeekMode,
  ReplaySpeed,
} from "../domain";

/** Application-facing API for the GSI bench CLI (implemented by the infrastructure composition root). */
export interface BenchCliApp {
  listRecords: () => Promise<readonly GsiRecordFile[]>;
  selectRecord: (
    records: readonly GsiRecordFile[],
    selectedIndex: number
  ) => GsiRecordFile | null;
  replayRecord: (record: GsiRecordFile) => Promise<ReplayResult>;
  analyzeRecordReplay: (record: GsiRecordFile) => Promise<ReplayResult>;
  createPlaybackSession: (replay: ReplayResult) => ReplayPlaybackSession;
  advancePlayback: (session: ReplayPlaybackSession, deltaMs: number) => ReplayPlaybackSession;
  seekPlaybackToSecond: (
    session: ReplayPlaybackSession,
    second: number,
    mode?: ReplaySeekMode
  ) => ReplayPlaybackSession;
  togglePlayback: (session: ReplayPlaybackSession) => ReplayPlaybackSession;
  toggleSeekMode: (session: ReplayPlaybackSession) => ReplayPlaybackSession;
  setPlaybackSpeed: (session: ReplayPlaybackSession, speed: ReplaySpeed) => ReplayPlaybackSession;
}

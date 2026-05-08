import type {
  GsiRecordFile,
  ReplayPlaybackSession,
  ReplayResult,
  ReplaySeekMode,
  ReplaySpeed,
} from "../../domain/bench";
import { listRecords } from "../../application/bench/useCases/listRecords";
import { selectRecord } from "../../application/bench/useCases/selectRecord";
import { replayRecord } from "../../application/bench/useCases/replayRecord";
import { analyzeRecordReplay } from "../../application/bench/useCases/analyzeRecordReplay";
import {
  advancePlayback,
  createPlaybackSession,
  seekPlaybackToSecond,
  setPlaybackSpeed,
  togglePlayback,
  toggleSeekMode,
} from "../../application/bench/useCases/playbackSession";
import { FsRecordCatalogAdapter } from "./adapters/FsRecordCatalogAdapter";
import { GsiProcessorReplayAdapter } from "./adapters/GsiProcessorReplayAdapter";
import { NdjsonRecordReaderAdapter } from "./adapters/NdjsonRecordReaderAdapter";

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

/** Composition root for the GSI bench CLI application. */
export class BenchCliAppService implements BenchCliApp {
  private readonly recordCatalog = new FsRecordCatalogAdapter();
  private readonly recordReader = new NdjsonRecordReaderAdapter();
  private readonly processorReplay = new GsiProcessorReplayAdapter();

  listRecords(): Promise<readonly GsiRecordFile[]> {
    return listRecords({ recordCatalog: this.recordCatalog });
  }

  selectRecord(
    records: readonly GsiRecordFile[],
    selectedIndex: number
  ): GsiRecordFile | null {
    return selectRecord({}, records, selectedIndex);
  }

  replayRecord(record: GsiRecordFile): Promise<ReplayResult> {
    return replayRecord(
      {
        recordReader: this.recordReader,
        processorReplay: this.processorReplay,
      },
      record
    );
  }

  analyzeRecordReplay(record: GsiRecordFile): Promise<ReplayResult> {
    return analyzeRecordReplay(
      {
        recordReader: this.recordReader,
        processorReplay: this.processorReplay,
      },
      record
    );
  }

  createPlaybackSession(replay: ReplayResult): ReplayPlaybackSession {
    return createPlaybackSession({}, replay);
  }

  advancePlayback(session: ReplayPlaybackSession, deltaMs: number): ReplayPlaybackSession {
    return advancePlayback({}, session, deltaMs);
  }

  seekPlaybackToSecond(
    session: ReplayPlaybackSession,
    second: number,
    mode?: ReplaySeekMode
  ): ReplayPlaybackSession {
    return seekPlaybackToSecond({}, session, second, mode);
  }

  togglePlayback(session: ReplayPlaybackSession): ReplayPlaybackSession {
    return togglePlayback({}, session);
  }

  toggleSeekMode(session: ReplayPlaybackSession): ReplayPlaybackSession {
    return toggleSeekMode({}, session);
  }

  setPlaybackSpeed(session: ReplayPlaybackSession, speed: ReplaySpeed): ReplayPlaybackSession {
    return setPlaybackSpeed({}, session, speed);
  }
}

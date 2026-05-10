import { withPorts } from "@cs2helper/shared";
import type {
  GsiRecordFile,
  ReplayPlaybackSession,
  ReplayResult,
  ReplaySeekMode,
  ReplaySpeed,
} from "../../domain/bench";
import type { BenchCliApp } from "../../application";
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

/**
 * Composition root: wires application use cases to infrastructure adapters.
 */
export class BenchCliApplication implements BenchCliApp {
  private readonly recordCatalog = new FsRecordCatalogAdapter();
  private readonly recordReader = new NdjsonRecordReaderAdapter();
  private readonly processorReplay = new GsiProcessorReplayAdapter();

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

  constructor() {
    this.listRecords = withPorts(listRecords, [this.recordCatalog]);
    this.selectRecord = withPorts(selectRecord, []);
    this.replayRecord = withPorts(replayRecord, [this.recordReader, this.processorReplay]);
    this.analyzeRecordReplay = withPorts(analyzeRecordReplay, [
      this.recordReader,
      this.processorReplay,
    ]);
    this.createPlaybackSession = withPorts(createPlaybackSession, []);
    this.advancePlayback = withPorts(advancePlayback, []);
    this.seekPlaybackToSecond = withPorts(seekPlaybackToSecond, []);
    this.togglePlayback = withPorts(togglePlayback, []);
    this.toggleSeekMode = withPorts(toggleSeekMode, []);
    this.setPlaybackSpeed = withPorts(setPlaybackSpeed, []);
  }
}

import type { GsiRecordFile, ReplayResult } from "../../domain/bench";
import { listRecords } from "../../application/bench/useCases/listRecords";
import { selectRecord } from "../../application/bench/useCases/selectRecord";
import { replayRecord } from "../../application/bench/useCases/replayRecord";
import { analyzeRecordReplay } from "../../application/bench/useCases/analyzeRecordReplay";
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
}

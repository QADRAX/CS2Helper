import type { UseCase } from "@cs2helper/shared";
import type { GsiRecordFile, ReplayResult } from "../../../domain/bench";
import type { ProcessorReplayPort, RecordReaderPort } from "../ports";
import { replayRecord } from "./replayRecord";

export interface AnalyzeRecordReplayPorts {
  recordReader: RecordReaderPort;
  processorReplay: ProcessorReplayPort;
}

/** Builds the per-tick replay timeline used by the analysis view. */
export const analyzeRecordReplay: UseCase<
  AnalyzeRecordReplayPorts,
  [record: GsiRecordFile],
  Promise<ReplayResult>
> = (ports, record) => replayRecord(ports, record);

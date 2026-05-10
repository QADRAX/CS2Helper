import type { UseCase } from "@cs2helper/shared";
import type { GsiRecordFile, ReplayResult } from "../../domain";
import type { ProcessorReplayPort, RecordReaderPort } from "../ports";
import { replayRecord } from "./replayRecord";

/**
 * Builds the per-tick replay timeline used by the analysis view.
 *
 * Ports tuple order: `[recordReader, processorReplay]`.
 */
export const analyzeRecordReplay: UseCase<
  [RecordReaderPort, ProcessorReplayPort],
  [record: GsiRecordFile],
  Promise<ReplayResult>
> = (ports, record) => replayRecord(ports, record);

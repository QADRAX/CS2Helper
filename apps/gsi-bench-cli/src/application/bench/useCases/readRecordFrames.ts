import type { UseCase } from "@cs2helper/shared";
import type { GsiRecordFile, ReadRecordFramesResult } from "../../../domain/bench";
import type { RecordReaderPort } from "../ports";

export interface ReadRecordFramesPorts {
  recordReader: RecordReaderPort;
}

/** Reads parsed frames and parse errors for one selected record. */
export const readRecordFrames: UseCase<
  ReadRecordFramesPorts,
  [record: GsiRecordFile],
  Promise<ReadRecordFramesResult>
> = ({ recordReader }, record) => recordReader.readFrames(record);

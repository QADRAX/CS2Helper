import type { UseCase } from "@cs2helper/shared";
import type { GsiRecordFile, ReplayResult } from "../../../domain/bench";
import type { ProcessorReplayPort, RecordReaderPort } from "../ports";

export interface ReplayRecordPorts {
  recordReader: RecordReaderPort;
  processorReplay: ProcessorReplayPort;
}

/** Replays one raw GSI record through the processor and returns the final result. */
export const replayRecord: UseCase<
  ReplayRecordPorts,
  [record: GsiRecordFile],
  Promise<ReplayResult>
> = async ({ recordReader, processorReplay }, record) => {
  const framesResult = await recordReader.readFrames(record);
  return processorReplay.replay(record, framesResult);
};

import type { UseCase } from "@cs2helper/shared";
import type { GsiRecordFile, ReplayResult } from "../../../domain/bench";
import type { ProcessorReplayPort, RecordReaderPort } from "../ports";

/**
 * Replays one raw GSI record through the processor and returns the final result.
 *
 * Ports tuple order: `[recordReader, processorReplay]`.
 */
export const replayRecord: UseCase<
  [RecordReaderPort, ProcessorReplayPort],
  [record: GsiRecordFile],
  Promise<ReplayResult>
> = async ([recordReader, processorReplay], record) => {
  const framesResult = await recordReader.readFrames(record);
  return processorReplay.replay(record, framesResult);
};

import type { UseCase } from "@cs2helper/shared";
import type { TickFrame } from "../../domain";
import { assembleTickFrame, type AssembleTickFrameOptions } from "./assembleTickFrame";
import type { MasterClockPort } from "../ports/MasterClockPort";
import type { TickSourcesPort } from "../ports/TickSourcesPort";
import type { TickRecordingSessionPort } from "../ports/TickRecordingSessionPort";

export type SubscribeTickFramesOptions = AssembleTickFrameOptions;

/**
 * On each master signal, assembles a {@link TickFrame}, optionally records it, then notifies the listener.
 * Ticks are processed **serially** in arrival order.
 *
 * Ports tuple order: `[master, sources, recordingSession]`.
 */
export const subscribeTickFrames: UseCase<
  [MasterClockPort, TickSourcesPort, TickRecordingSessionPort],
  [listener: (frame: TickFrame) => void, options?: SubscribeTickFramesOptions],
  () => void
> = ([master, sourcesPort, recordingSession], listener, options) => {
  let seq = 0;
  let chain = Promise.resolve();

  const unsub = master.subscribe((signal) => {
    chain = chain
      .then(async () => {
        seq += 1;
        const receivedAtMs = signal.receivedAtMs ?? Date.now();
        const frame = await assembleTickFrame(
          signal,
          { sequence: seq, receivedAtMs },
          sourcesPort.getSources(),
          options
        );
        const sink = recordingSession.getSink();
        if (sink) {
          await sink.appendFrame(frame);
        }
        listener(frame);
      })
      .catch(() => {
        /* isolated tick failure — keep processing subsequent ticks */
      });
  });

  return () => {
    unsub();
  };
};

import type { UseCase } from "@cs2helper/shared";
import type { TickFrame } from "../../domain";
import { assembleTickFrame, type AssembleTickFrameOptions } from "./assembleTickFrame";
import type { MasterClockPort, MasterTickSignal } from "../ports/MasterClockPort";
import type { TickSourcesPort } from "../ports/TickSourcesPort";
import type { TickRecordingSessionPort } from "../ports/TickRecordingSessionPort";

export interface SubscribeTickFramesOptions extends AssembleTickFrameOptions {
  /**
   * When true and no recording sink is active, a new master signal **replaces** any
   * tick still waiting to be assembled so consumers track live GSI instead of draining
   * a long backlog. Recording (sink set) always processes every signal in order.
   */
  coalesceQueuedMasterSignals?: boolean;
}

/**
 * On each master signal, assembles a {@link TickFrame}, optionally records it, then notifies the listener.
 * By default, ticks are processed **serially** in arrival order. Optional coalescing skips intermediate
   * master signals while a tick is still being assembled **only when not recording**.
 *
 * Ports tuple order: `[master, sources, recordingSession]`.
 */
export const subscribeTickFrames: UseCase<
  [MasterClockPort, TickSourcesPort, TickRecordingSessionPort],
  [listener: (frame: TickFrame) => void, options?: SubscribeTickFramesOptions],
  () => void
> = ([master, sourcesPort, recordingSession], listener, options) => {
  let seq = 0;
  let serialTail = Promise.resolve();

  let coalesceLatest: MasterTickSignal | null = null;
  let coalescePumpRunning = false;

  const processOne = async (signal: MasterTickSignal): Promise<void> => {
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
  };

  const pumpCoalesced = (): void => {
    if (coalescePumpRunning) {
      return;
    }
    coalescePumpRunning = true;
    void (async () => {
      try {
        while (coalesceLatest !== null) {
          if (recordingSession.getSink() != null) {
            const sig = coalesceLatest;
            coalesceLatest = null;
            serialTail = serialTail.then(() => processOne(sig)).catch(() => {
              /* isolated tick failure */
            });
            break;
          }
          const signal = coalesceLatest;
          coalesceLatest = null;
          await processOne(signal);
        }
      } catch {
        /* isolated tick failure */
      } finally {
        coalescePumpRunning = false;
        if (
          coalesceLatest !== null &&
          options?.coalesceQueuedMasterSignals === true &&
          recordingSession.getSink() == null
        ) {
          pumpCoalesced();
        }
      }
    })();
  };

  const unsub = master.subscribe((signal) => {
    const sink = recordingSession.getSink();
    const wantCoalesce = options?.coalesceQueuedMasterSignals === true && sink == null;

    if (wantCoalesce) {
      coalesceLatest = signal;
      pumpCoalesced();
      return;
    }

    serialTail = serialTail
      .then(() => processOne(signal))
      .catch(() => {
        /* isolated tick failure */
      });
  });

  return () => {
    unsub();
  };
};

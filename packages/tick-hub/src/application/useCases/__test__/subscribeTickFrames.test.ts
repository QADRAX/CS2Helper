import { describe, expect, it, vi } from "vitest";
import type {
  MasterClockPort,
  TickRecordingPort,
  TickRecordingSessionPort,
  TickSourcesPort,
} from "../../ports";
import { subscribeTickFrames } from "../subscribeTickFrames";

describe("subscribeTickFrames", () => {
  it("records and notifies in serial order", async () => {
    const masterListeners: Array<(s: { data: unknown }) => void> = [];
    const master: MasterClockPort = {
      subscribe: (fn) => {
        masterListeners.push(fn);
        return () => {};
      },
    };
    const sourcesPort: TickSourcesPort = { getSources: () => [] };
    let activeSink: TickRecordingPort | null = null;
    const session: TickRecordingSessionPort = {
      setSink: (s) => {
        activeSink = s;
      },
      getSink: () => activeSink,
    };
    const recording: TickRecordingPort = {
      appendFrame: vi.fn().mockResolvedValue(undefined),
    };

    const listener = vi.fn();
    subscribeTickFrames([master, sourcesPort, session], listener, {});

    session.setSink(recording);

    masterListeners[0]!({ data: { n: 1 } });
    masterListeners[0]!({ data: { n: 2 } });

    await new Promise((r) => setTimeout(r, 0));

    expect(listener.mock.calls.length).toBe(2);
    expect(listener.mock.calls[0][0].master).toEqual({ n: 1 });
    expect(listener.mock.calls[1][0].master).toEqual({ n: 2 });
    expect(recording.appendFrame).toHaveBeenCalledTimes(2);
  });
});

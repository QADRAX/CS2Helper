import { describe, expect, it, vi } from "vitest";
import type { MasterClockPort, TickSourcePort } from "../../application/ports";
import { InMemoryTickRecordingAdapter } from "../adapters/InMemoryTickRecordingAdapter";
import { TickHubService } from "../TickHubService";

describe("TickHubService", () => {
  it("wires master + sources + recording without domain-specific deps", async () => {
    let emit: ((s: { data: unknown }) => void) | undefined;
    const master: MasterClockPort = {
      subscribe: (fn) => {
        emit = fn;
        return () => {};
      },
    };
    const align = vi.fn().mockResolvedValue(undefined);
    const perf: TickSourcePort = {
      id: "performance",
      async captureOnTick() {
        await align();
        return { fps: 144 };
      },
    };

    const hub = new TickHubService(master, [perf], {});
    const mem = new InMemoryTickRecordingAdapter();
    hub.startTickRecording(mem);

    const listener = vi.fn();
    hub.subscribeTickFrames(listener);

    emit!({ data: { tick: "gsi" } });

    await new Promise((r) => setTimeout(r, 0));

    expect(align).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].master).toEqual({ tick: "gsi" });
    expect(listener.mock.calls[0][0].sources.performance).toEqual({ fps: 144 });
    expect(mem.frames.length).toBe(1);
  });
});

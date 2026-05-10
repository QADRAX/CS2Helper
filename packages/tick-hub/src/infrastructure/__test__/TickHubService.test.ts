import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { MasterClockPort, TickSourcePort } from "../../application/ports";
import { TickHubService } from "../TickHubService";

describe("TickHubService", () => {
  it("implements TickHub: wires master + sources", async () => {
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
    const listener = vi.fn();
    hub.subscribeTickFrames(listener);

    emit!({ data: { tick: "gsi" } });

    await new Promise((r) => setTimeout(r, 0));

    expect(align).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].master).toEqual({ tick: "gsi" });
    expect(listener.mock.calls[0][0].sources.performance).toEqual({ fps: 144 });
  });

  it("startRecording appends JSONL lines", async () => {
    let emit: ((s: { data: unknown }) => void) | undefined;
    const master: MasterClockPort = {
      subscribe: (fn) => {
        emit = fn;
        return () => {};
      },
    };
    const hub = new TickHubService(master, [], {});

    const dir = await mkdtemp(join(tmpdir(), "tick-hub-"));
    const recordingPath = join(dir, "out.jsonl");

    try {
      hub.startRecording(recordingPath);
      hub.subscribeTickFrames(() => {});
      emit!({ data: { n: 1 } });
      await new Promise((r) => setTimeout(r, 50));
      const raw = await readFile(recordingPath, "utf8");
      expect(JSON.parse(raw.trim()).master).toEqual({ n: 1 });
      await hub.stopRecording();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

import { describe, expect, it, vi } from "vitest";
import { TICK_HUB_SCHEMA_VERSION } from "../../../domain";
import type { TickSourcePort } from "../../ports";
import { assembleTickFrame } from "../assembleTickFrame";

describe("assembleTickFrame", () => {
  it("sets master from signal and merges source payloads", async () => {
    const src: TickSourcePort = {
      id: "a",
      captureOnTick: vi.fn().mockResolvedValue({ n: 1 }),
    };
    const frame = await assembleTickFrame(
      { data: { hello: "world" } },
      { sequence: 2, receivedAtMs: 500 },
      [src],
      { sourceTimeoutMs: 200 }
    );
    expect(frame.schemaVersion).toBe(TICK_HUB_SCHEMA_VERSION);
    expect(frame.sequence).toBe(2);
    expect(frame.receivedAtMs).toBe(500);
    expect(frame.master).toEqual({ hello: "world" });
    expect(frame.sources.a).toEqual({ n: 1 });
  });

  it("records source failures as { error }", async () => {
    const bad: TickSourcePort = {
      id: "b",
      captureOnTick: vi.fn().mockRejectedValue(new Error("boom")),
    };
    const frame = await assembleTickFrame({ data: null }, { sequence: 1, receivedAtMs: 0 }, [bad]);
    expect(frame.sources.b).toEqual({ error: "boom" });
  });

  it("maps source timeouts to errors", async () => {
    const slow: TickSourcePort = {
      id: "c",
      captureOnTick: vi.fn().mockImplementation(() => new Promise(() => {})),
    };
    const frame = await assembleTickFrame(
      { data: {} },
      { sequence: 1, receivedAtMs: 0 },
      [slow],
      { sourceTimeoutMs: 20 }
    );
    expect(frame.sources.c).toEqual({ error: "source timeout" });
  });
});

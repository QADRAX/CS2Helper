import { describe, expect, it, vi } from "vitest";

import type { HandleScoreboardHotkeyPorts } from "../useCases/handleScoreboardHotkey";
import { handleScoreboardHotkey } from "../useCases/handleScoreboardHotkey";

describe("handleScoreboardHotkey", () => {
  it("skips when gates fail", async () => {
    const captureCs2ClientPng = vi.fn();
    const ports: HandleScoreboardHotkeyPorts = [
      { getMatchSignal: () => ({ hasActiveMatch: false }) },
      { isCs2Foreground: async () => true },
      { captureCs2ClientPng },
      { writeSnapshot: vi.fn() },
      { nowMs: () => 1 },
    ];

    const r = await handleScoreboardHotkey(ports, { matchPhaseGate: "currentMatchOnly" });
    expect(r).toEqual({ outcome: "skipped", reason: "no_active_match" });
    expect(captureCs2ClientPng).not.toHaveBeenCalled();
  });

  it("captures and writes when gates pass", async () => {
    const png = new Uint8Array([1, 2, 3]);
    const captureCs2ClientPng = vi.fn(async () => png);
    const writeSnapshot = vi.fn(async () => ({ absolutePath: "C:\\\\snap\\\\scoreboard-test.png" }));

    const ports: HandleScoreboardHotkeyPorts = [
      { getMatchSignal: () => ({ hasActiveMatch: true, mapPhase: "live" }) },
      { isCs2Foreground: async () => true },
      { captureCs2ClientPng },
      { writeSnapshot },
      { nowMs: () => new Date("2026-05-10T12:00:00.000Z").getTime() },
    ];

    const r = await handleScoreboardHotkey(ports, { matchPhaseGate: "currentMatchOnly" });
    expect(r.outcome).toBe("captured");
    if (r.outcome === "captured") {
      expect(r.absolutePath).toBe("C:\\\\snap\\\\scoreboard-test.png");
    }
    expect(captureCs2ClientPng).toHaveBeenCalledOnce();
    expect(writeSnapshot).toHaveBeenCalledOnce();
    expect(writeSnapshot).toHaveBeenCalledWith(expect.stringMatching(/^scoreboard-.*\.png$/), png);
  });

  it("returns capture_failed when capture throws", async () => {
    const ports: HandleScoreboardHotkeyPorts = [
      { getMatchSignal: () => ({ hasActiveMatch: true }) },
      { isCs2Foreground: async () => true },
      {
        captureCs2ClientPng: async () => {
          throw new Error("boom");
        },
      },
      { writeSnapshot: vi.fn() },
      { nowMs: () => 1 },
    ];

    const r = await handleScoreboardHotkey(ports, { matchPhaseGate: "currentMatchOnly" });
    expect(r).toEqual({ outcome: "capture_failed", error: "boom" });
  });
});

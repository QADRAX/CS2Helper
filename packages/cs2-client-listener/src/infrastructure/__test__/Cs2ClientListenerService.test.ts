import { describe, expect, it, vi } from "vitest";
import type { GsiGateway } from "@cs2helper/gsi-gateway";
import type { Cs2PerformanceApi } from "@cs2helper/performance-processor";
import { InMemoryTickRecordingAdapter } from "@cs2helper/tick-hub";
import { Cs2ClientListenerService } from "../Cs2ClientListenerService";

describe("Cs2ClientListenerService", () => {
  it("emits tick frames with gsi master + aligned performance", async () => {
    let rawListener: ((raw: string) => void) | undefined;
    const gateway = {
      subscribeRawTicks: vi.fn((fn: (raw: string) => void) => {
        rawListener = fn;
        return () => {};
      }),
      getState: vi.fn().mockReturnValue({ totalTicks: 1 }),
    } as unknown as GsiGateway;

    const align = vi.fn().mockResolvedValue(undefined);
    const performance = {
      subscribeCs2ProcessTrackingForAlignment: vi.fn().mockImplementation((onSnap: (s: unknown) => void) => {
        onSnap({ running: true, pid: 99 });
        return {
          unsubscribe: vi.fn(),
          alignToExternalTick: align,
        };
      }),
    } as unknown as Cs2PerformanceApi;

    const svc = new Cs2ClientListenerService(gateway, performance, {});
    const mem = new InMemoryTickRecordingAdapter();
    svc.startTickRecording(mem);

    const listener = vi.fn();
    svc.subscribeTickFrames(listener);

    rawListener!("{}");

    await new Promise((r) => setTimeout(r, 0));

    expect(align).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].master).toEqual({ state: { totalTicks: 1 }, raw: "{}" });
    expect(listener.mock.calls[0][0].sources.performance).toEqual({ running: true, pid: 99 });
    expect(mem.frames.length).toBe(1);
  });
});

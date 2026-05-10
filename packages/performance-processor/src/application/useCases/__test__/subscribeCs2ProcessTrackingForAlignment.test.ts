import { describe, expect, it, vi } from "vitest";
import type {
  Cs2ProcessPort,
  GpuProcessMetricsPort,
  OsProcessMetricsPort,
  PresentChainMetricsPort,
} from "../../ports";
import { subscribeCs2ProcessTrackingForAlignment } from "../subscribeCs2ProcessTrackingForAlignment";

describe("subscribeCs2ProcessTrackingForAlignment", () => {
  it("alignToExternalTick emits latest present even when presentNotifyIntervalMs blocks frame callbacks", async () => {
    let onFrame: ((s: { frametimeMs: number }) => void) | undefined;
    const cs2Process: Cs2ProcessPort = {
      isRunning: async () => true,
      getStatus: async () => ({ running: true, pid: 99 }),
    };
    const sampleOs = vi.fn().mockResolvedValue({ workingSetBytes: 1 });
    const osMetrics: OsProcessMetricsPort = { sample: sampleOs };
    const gpuMetrics: GpuProcessMetricsPort = { sample: vi.fn().mockResolvedValue(null) };
    const startSession = vi.fn().mockImplementation(async (opts: { onFrame?: (s: unknown) => void }) => {
      onFrame = opts.onFrame as (s: { frametimeMs: number }) => void;
      onFrame?.({ frametimeMs: 16 });
      return { stop: vi.fn().mockResolvedValue(undefined) };
    });
    const presentChain: PresentChainMetricsPort = { startSession };

    const listener = vi.fn();
    const { alignToExternalTick, unsubscribe } = subscribeCs2ProcessTrackingForAlignment(
      [cs2Process, osMetrics, gpuMetrics, presentChain],
      listener,
      {
        processPollIntervalMs: 10_000,
        presentNotifyIntervalMs: 60_000,
        systemMetricsIntervalMs: 10_000,
        externalAlignSystemSampleMinMs: 0,
      }
    );

    await new Promise((r) => setTimeout(r, 20));
    listener.mockClear();

    onFrame?.({ frametimeMs: 8.5 });
    await alignToExternalTick();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].present).toEqual({ frametimeMs: 8.5 });

    unsubscribe();
  });

  it("respects externalAlignSystemSampleMinMs for OS/GPU resample on align", async () => {
    const cs2Process: Cs2ProcessPort = {
      isRunning: async () => true,
      getStatus: async () => ({ running: true, pid: 1 }),
    };
    const sampleOs = vi.fn().mockResolvedValue({ workingSetBytes: 1 });
    const startSession = vi.fn().mockResolvedValue({ stop: vi.fn().mockResolvedValue(undefined) });
    const listener = vi.fn();
    const { alignToExternalTick, unsubscribe } = subscribeCs2ProcessTrackingForAlignment(
      [cs2Process, { sample: sampleOs }, { sample: vi.fn().mockResolvedValue(null) }, { startSession }],
      listener,
      {
        processPollIntervalMs: 10_000,
        systemMetricsIntervalMs: 10_000,
        externalAlignSystemSampleMinMs: 100,
      }
    );

    await new Promise((r) => setTimeout(r, 25));
    sampleOs.mockClear();
    await new Promise((r) => setTimeout(r, 120));

    await alignToExternalTick();
    expect(sampleOs).toHaveBeenCalledTimes(1);
    await alignToExternalTick();
    expect(sampleOs).toHaveBeenCalledTimes(1);

    await new Promise((r) => setTimeout(r, 110));
    await alignToExternalTick();
    expect(sampleOs).toHaveBeenCalledTimes(2);

    unsubscribe();
  });
});

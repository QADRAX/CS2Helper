import { describe, expect, it, vi } from "vitest";
import type {
  Cs2ProcessPort,
  GpuProcessMetricsPort,
  OsProcessMetricsPort,
  PresentChainMetricsPort,
} from "../../ports";
import { subscribeCs2ProcessTracking } from "../subscribeCs2ProcessTracking";

describe("subscribeCs2ProcessTracking", () => {
  it("samples OS/GPU and starts PresentMon when running with pid; stops when process ends", async () => {
    let running = true;
    const cs2Process: Cs2ProcessPort = {
      isRunning: async () => running,
      getStatus: async () => ({ running, pid: 42 }),
    };

    const sampleOs = vi.fn().mockResolvedValue({ workingSetBytes: 1000 });
    const osMetrics: OsProcessMetricsPort = { sample: sampleOs };

    const sampleGpu = vi.fn().mockResolvedValue({ gpuUtilizationPercent: 10 });
    const gpuMetrics: GpuProcessMetricsPort = { sample: sampleGpu };

    const stop = vi.fn().mockResolvedValue(undefined);
    const startSession = vi.fn().mockImplementation(async (opts: { onFrame?: (s: unknown) => void }) => {
      opts.onFrame?.({ frametimeMs: 20 });
      return { stop };
    });
    const presentChain: PresentChainMetricsPort = { startSession };

    const listener = vi.fn();

    const unsub = subscribeCs2ProcessTracking(
      [cs2Process, osMetrics, gpuMetrics, presentChain],
      listener,
      { processPollIntervalMs: 15 }
    );

    await new Promise((r) => setTimeout(r, 45));
    expect(startSession).toHaveBeenCalledWith(expect.objectContaining({ pid: 42 }));
    expect(sampleOs).toHaveBeenCalledWith(42);
    expect(sampleGpu).toHaveBeenCalledWith(42);
    expect(listener.mock.calls.length).toBeGreaterThan(0);
    const lastRunning = listener.mock.calls.at(-1)?.[0];
    expect(lastRunning?.running).toBe(true);
    expect(lastRunning?.pid).toBe(42);
    expect(lastRunning?.os).toEqual({ workingSetBytes: 1000 });

    running = false;
    await new Promise((r) => setTimeout(r, 45));
    expect(stop).toHaveBeenCalled();

    unsub();
  });

  it("derives cpuPercent from successive Win32_Process time samples", async () => {
    const cs2Process: Cs2ProcessPort = {
      isRunning: async () => true,
      getStatus: async () => ({ running: true, pid: 7 }),
    };

    let sampleN = 0;
    const osMetrics: OsProcessMetricsPort = {
      sample: vi.fn().mockImplementation(async () => {
        sampleN += 1;
        const base = sampleN * 200;
        return {
          kernelTimeMs: base,
          userTimeMs: base * 0.5,
          workingSetBytes: 4096,
        };
      }),
    };

    const startSession = vi.fn().mockResolvedValue({ stop: vi.fn().mockResolvedValue(undefined) });
    const presentChain: PresentChainMetricsPort = { startSession };

    const listener = vi.fn();
    const unsub = subscribeCs2ProcessTracking(
      [cs2Process, osMetrics, { sample: vi.fn().mockResolvedValue(null) }, presentChain],
      listener,
      { processPollIntervalMs: 20 }
    );

    await new Promise((r) => setTimeout(r, 55));
    const withCpu = listener.mock.calls.map((c) => c[0]?.os?.cpuPercent).filter((x) => x !== undefined);
    expect(withCpu.length).toBeGreaterThan(0);
    expect(withCpu[0]).toBeGreaterThan(0);

    unsub();
  });

  it("samples OS/GPU at systemMetricsIntervalMs when faster than process poll", async () => {
    const cs2Process: Cs2ProcessPort = {
      isRunning: async () => true,
      getStatus: async () => ({ running: true, pid: 1 }),
    };
    const sampleOs = vi.fn().mockResolvedValue({ workingSetBytes: 1 });
    const startSession = vi.fn().mockResolvedValue({ stop: vi.fn().mockResolvedValue(undefined) });
    const unsub = subscribeCs2ProcessTracking(
      [cs2Process, { sample: sampleOs }, { sample: vi.fn().mockResolvedValue(null) }, { startSession }],
      () => {},
      { processPollIntervalMs: 25, systemMetricsIntervalMs: 100 }
    );
    await new Promise((r) => setTimeout(r, 130));
    expect(sampleOs.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(sampleOs.mock.calls.length).toBeLessThanOrEqual(3);
    unsub();
  });

  it("does not start PresentMon when not running", async () => {
    const cs2Process: Cs2ProcessPort = {
      isRunning: async () => false,
      getStatus: async () => ({ running: false }),
    };
    const startSession = vi.fn();
    const unsub = subscribeCs2ProcessTracking(
      [cs2Process, { sample: vi.fn() }, { sample: vi.fn() }, { startSession }],
      () => {},
      { processPollIntervalMs: 10 }
    );
    await new Promise((r) => setTimeout(r, 35));
    expect(startSession).not.toHaveBeenCalled();
    unsub();
  });
});

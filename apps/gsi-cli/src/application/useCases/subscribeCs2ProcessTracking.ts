import { cpus } from "node:os";
import type { UseCase } from "@cs2helper/shared";
import {
  DEFAULT_CS2_PROCESS_TRACKING_INTERVAL_MS,
  DEFAULT_PRESENT_TELEMETRY_THROTTLE_MS,
  type Cs2ProcessTrackingSnapshot,
  type OsProcessMetricsSample,
} from "../../domain/telemetry";
import type {
  Cs2ProcessPort,
  GpuProcessMetricsPort,
  OsProcessMetricsPort,
  PresentChainMetricsPort,
} from "../ports";

export interface SubscribeCs2ProcessTrackingOptions {
  /**
   * Poll cadence in milliseconds.
   * Defaults to {@link DEFAULT_CS2_PROCESS_TRACKING_INTERVAL_MS}.
   */
  intervalMs?: number;
  /**
   * Present-chain frames can arrive often; cap how frequently the listener is notified
   * with updated `present` (and last OS/GPU samples) so UI can refresh FPS without
   * polling PowerShell every frame.
   * Defaults to {@link DEFAULT_PRESENT_TELEMETRY_THROTTLE_MS}.
   */
  presentTelemetryThrottleMs?: number;
}

function logicalCpuCount(): number {
  const n = cpus().length;
  return n > 0 ? n : 1;
}

function cpuPercentSinceLastSample(
  current: OsProcessMetricsSample,
  previous: OsProcessMetricsSample,
  wallMs: number,
  logicalCpus: number
): number | undefined {
  const k = current.kernelTimeMs;
  const u = current.userTimeMs;
  const pk = previous.kernelTimeMs;
  const pu = previous.userTimeMs;
  if (k === undefined || u === undefined || pk === undefined || pu === undefined) {
    return undefined;
  }
  if (wallMs < 1) return undefined;
  const deltaCpuMs = k + u - pk - pu;
  if (deltaCpuMs < 0) return undefined;
  const n = Math.max(1, logicalCpus);
  return Math.min(100 * n, (100 * deltaCpuMs) / (wallMs * n));
}

function withDerivedCpuPercent(
  raw: OsProcessMetricsSample,
  previousRaw: OsProcessMetricsSample | undefined,
  previousAtMs: number | undefined,
  nowMs: number,
  logicalCpus: number
): OsProcessMetricsSample {
  if (previousRaw === undefined || previousAtMs === undefined) {
    return raw;
  }
  const wall = nowMs - previousAtMs;
  const pct = cpuPercentSinceLastSample(raw, previousRaw, wall, logicalCpus);
  return pct === undefined ? raw : { ...raw, cpuPercent: pct };
}

function statusKey(running: boolean, pid: number | undefined): string {
  return `${running}:${pid ?? ""}`;
}

/**
 * Polls CS2 process visibility and, when running with a PID, samples OS/GPU metrics
 * and maintains a PresentMon session whose latest frame is attached to each snapshot.
 *
 * Ports tuple order: `[cs2Process, osMetrics, gpuMetrics, presentChain]`.
 */
export const subscribeCs2ProcessTracking: UseCase<
  [Cs2ProcessPort, OsProcessMetricsPort, GpuProcessMetricsPort, PresentChainMetricsPort],
  [
    listener: (snapshot: Cs2ProcessTrackingSnapshot) => void,
    options?: SubscribeCs2ProcessTrackingOptions,
  ],
  () => void
> = (ports, listener, options) => {
  const [cs2Process, osMetrics, gpuMetrics, presentChain] = ports;
  const intervalMs = options?.intervalMs ?? DEFAULT_CS2_PROCESS_TRACKING_INTERVAL_MS;
  const presentTelemetryThrottleMs =
    options?.presentTelemetryThrottleMs ?? DEFAULT_PRESENT_TELEMETRY_THROTTLE_MS;
  const cpusN = logicalCpuCount();
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastIdleKey: string | null = null;

  let presentSession: Awaited<ReturnType<PresentChainMetricsPort["startSession"]>> | null = null;
  let sessionPid: number | null = null;
  let lastPresent: Cs2ProcessTrackingSnapshot["present"];
  let presentChainError: string | undefined;
  let lastPresentListenerAtMs = 0;

  let prevOsRaw: OsProcessMetricsSample | undefined;
  let prevOsRawAtMs: number | undefined;
  let prevOsPid: number | undefined;

  let lastTickOs: Cs2ProcessTrackingSnapshot["os"];
  let lastTickGpu: Cs2ProcessTrackingSnapshot["gpu"];

  const tearDownPresent = async (): Promise<void> => {
    if (presentSession) {
      try {
        await presentSession.stop();
      } catch {
        /* ignore */
      }
      presentSession = null;
    }
    sessionPid = null;
    lastPresent = undefined;
    presentChainError = undefined;
    lastPresentListenerAtMs = 0;
  };

  const emitRunning = (pid: number): void => {
    listener({
      running: true,
      pid,
      os: lastTickOs,
      gpu: lastTickGpu,
      present: lastPresent,
      presentChainError,
    });
  };

  const ensurePresent = async (pid: number): Promise<void> => {
    if (sessionPid === pid && presentSession) {
      return;
    }
    await tearDownPresent();
    try {
      presentSession = await presentChain.startSession({
        pid,
        onFrame: (s) => {
          lastPresent = s;
          if (cancelled) return;
          const now = Date.now();
          if (now - lastPresentListenerAtMs < presentTelemetryThrottleMs) return;
          lastPresentListenerAtMs = now;
          emitRunning(pid);
        },
      });
      sessionPid = pid;
      presentChainError = undefined;
    } catch (err) {
      presentSession = null;
      sessionPid = null;
      lastPresent = undefined;
      presentChainError = err instanceof Error ? err.message : String(err);
    }
  };

  const tick = async (): Promise<void> => {
    if (cancelled) return;
    try {
      const status = await cs2Process.getStatus();
      if (cancelled) return;

      const { running, pid } = status;
      const key = statusKey(running, pid);

      if (running && pid !== undefined && Number.isInteger(pid) && pid > 0) {
        await ensurePresent(pid);
        if (cancelled) return;

        if (prevOsPid !== pid) {
          prevOsRaw = undefined;
          prevOsRawAtMs = undefined;
          prevOsPid = pid;
        }

        let os: Cs2ProcessTrackingSnapshot["os"];
        let gpu: Cs2ProcessTrackingSnapshot["gpu"];
        try {
          os = await osMetrics.sample(pid);
        } catch {
          os = undefined;
        }
        try {
          gpu = await gpuMetrics.sample(pid);
        } catch {
          gpu = undefined;
        }

        const nowMs = Date.now();
        if (os !== undefined) {
          const rawOs = os;
          os = withDerivedCpuPercent(rawOs, prevOsRaw, prevOsRawAtMs, nowMs, cpusN);
          prevOsRaw = rawOs;
          prevOsRawAtMs = nowMs;
        }

        lastTickOs = os;
        lastTickGpu = gpu;
        emitRunning(pid);
        lastPresentListenerAtMs = Date.now();
        lastIdleKey = key;
      } else {
        await tearDownPresent();
        if (cancelled) return;

        prevOsRaw = undefined;
        prevOsRawAtMs = undefined;
        prevOsPid = undefined;

        const snapshot: Cs2ProcessTrackingSnapshot = { running, pid };
        if (lastIdleKey !== key) {
          listener(snapshot);
          lastIdleKey = key;
        }
      }
    } catch {
      /* keep polling on transient failures */
    } finally {
      if (!cancelled) {
        timer = setTimeout(() => {
          void tick();
        }, intervalMs);
      }
    }
  };

  void tick();

  return () => {
    cancelled = true;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    void tearDownPresent();
  };
};

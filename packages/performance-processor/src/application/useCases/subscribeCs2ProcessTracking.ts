import { cpus } from "node:os";
import type { UseCase } from "@cs2helper/shared";
import {
  cs2ProcessTrackingStatusKey,
  normalizeLogicalCpuCount,
  resolveCs2ProcessTrackingPollIntervals,
  withDerivedCpuPercent,
  type Cs2ProcessTrackingPollOptions,
  type Cs2ProcessTrackingSnapshot,
  type OsProcessMetricsSample,
} from "../../domain/telemetry";
import type {
  Cs2ProcessPort,
  GpuProcessMetricsPort,
  OsProcessMetricsPort,
  PresentChainMetricsPort,
} from "../ports";

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
    options?: Cs2ProcessTrackingPollOptions,
  ],
  () => void
> = (ports, listener, options) => {
  const [cs2Process, osMetrics, gpuMetrics, presentChain] = ports;
  const { processPollMs, systemMetricsMs, presentNotifyMs } =
    resolveCs2ProcessTrackingPollIntervals(options);
  const cpusN = normalizeLogicalCpuCount(cpus().length);
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
  let lastSystemSampleAtMs = 0;

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
          if (now - lastPresentListenerAtMs < presentNotifyMs) return;
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
      emitRunning(pid);
    }
  };

  const tick = async (): Promise<void> => {
    if (cancelled) return;
    try {
      const status = await cs2Process.getStatus();
      if (cancelled) return;

      const { running, pid } = status;
      const key = cs2ProcessTrackingStatusKey(running, pid);

      if (running && pid !== undefined && Number.isInteger(pid) && pid > 0) {
        await ensurePresent(pid);
        if (cancelled) return;

        if (prevOsPid !== pid) {
          prevOsRaw = undefined;
          prevOsRawAtMs = undefined;
          prevOsPid = pid;
          lastSystemSampleAtMs = 0;
        }

        const nowMs = Date.now();
        const shouldSampleSystem =
          lastSystemSampleAtMs === 0 || nowMs - lastSystemSampleAtMs >= systemMetricsMs;

        if (shouldSampleSystem) {
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

          if (os !== undefined) {
            const rawOs = os;
            os = withDerivedCpuPercent(rawOs, prevOsRaw, prevOsRawAtMs, nowMs, cpusN);
            prevOsRaw = rawOs;
            prevOsRawAtMs = nowMs;
          }

          lastTickOs = os;
          lastTickGpu = gpu;
          lastSystemSampleAtMs = nowMs;
          emitRunning(pid);
          lastPresentListenerAtMs = Date.now();
        }

        lastIdleKey = key;
      } else {
        await tearDownPresent();
        if (cancelled) return;

        prevOsRaw = undefined;
        prevOsRawAtMs = undefined;
        prevOsPid = undefined;
        lastSystemSampleAtMs = 0;

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
        }, processPollMs);
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

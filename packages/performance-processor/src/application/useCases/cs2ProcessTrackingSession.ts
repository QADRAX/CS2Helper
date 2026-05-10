import { cpus } from "node:os";
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

export interface Cs2ProcessTrackingSession {
  startPollLoop: () => void;
  /** Awaits one serialized align (for tests / manual flush). */
  alignToExternalTick: () => Promise<void>;
  /**
   * Enqueues an align on a serialized pipeline and returns immediately so the tick hub
   * does not block on CIM/PresentMon; {@link listener} updates as each align completes.
   */
  scheduleAlignToExternalTick: () => void;
  dispose: () => void;
}

/**
 * Shared session for CS2 process tracking: internal poll loop plus optional
 * {@link Cs2ProcessTrackingSession.alignToExternalTick} for master-clock alignment (e.g. GSI ticks).
 *
 * Ports tuple order: `[cs2Process, osMetrics, gpuMetrics, presentChain]`.
 */
export function createCs2ProcessTrackingSession(
  ports: [
    Cs2ProcessPort,
    OsProcessMetricsPort,
    GpuProcessMetricsPort,
    PresentChainMetricsPort,
  ],
  listener: (snapshot: Cs2ProcessTrackingSnapshot) => void,
  options?: Cs2ProcessTrackingPollOptions
): Cs2ProcessTrackingSession {
  const [cs2Process, osMetrics, gpuMetrics, presentChain] = ports;
  const { processPollMs, systemMetricsMs, presentNotifyMs, externalAlignSystemSampleMinMs } =
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

  const sampleSystemMetrics = async (pid: number, nowMs: number): Promise<void> => {
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
  };

  const runAlign = async (): Promise<void> => {
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
          lastSystemSampleAtMs === 0 ||
          nowMs - lastSystemSampleAtMs >= externalAlignSystemSampleMinMs;

        if (shouldSampleSystem) {
          await sampleSystemMetrics(pid, nowMs);
        }

        emitRunning(pid);
        lastPresentListenerAtMs = Date.now();
        lastIdleKey = key;
      } else {
        await tearDownPresent();
        if (cancelled) return;

        prevOsRaw = undefined;
        prevOsRawAtMs = undefined;
        prevOsPid = undefined;
        lastSystemSampleAtMs = 0;

        const snapshot: Cs2ProcessTrackingSnapshot = { running, pid };
        // Align is driven by every GSI tick: always publish so `lastPerf` stays fresh after hub re-subscribe.
        listener(snapshot);
        lastIdleKey = key;
      }
    } catch (err) {
      if (cancelled) return;
      listener({
        running: false,
        presentChainError: err instanceof Error ? err.message : String(err),
      });
    }
  };

  /** Serialized so overlapping aligns never mutate session state concurrently. */
  let alignPipeline: Promise<void> = Promise.resolve();

  const scheduleAlignToExternalTick = (): void => {
    alignPipeline = alignPipeline.then(() => runAlign()).catch(() => {});
  };

  const alignToExternalTick = (): Promise<void> => {
    return new Promise<void>((resolve) => {
      alignPipeline = alignPipeline
        .then(() => runAlign())
        .then(() => resolve(), () => resolve());
    });
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
          await sampleSystemMetrics(pid, nowMs);
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

  const startPollLoop = (): void => {
    void tick();
  };

  const dispose = (): void => {
    cancelled = true;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    void tearDownPresent();
  };

  return { startPollLoop, alignToExternalTick, scheduleAlignToExternalTick, dispose };
}

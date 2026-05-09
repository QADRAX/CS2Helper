import type { UseCase } from "@cs2helper/shared";
import {
  DEFAULT_CS2_PROCESS_TRACKING_INTERVAL_MS,
  type Cs2ProcessTrackingSnapshot,
} from "../../../domain/telemetry";
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
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastIdleKey: string | null = null;

  let presentSession: Awaited<ReturnType<PresentChainMetricsPort["startSession"]>> | null = null;
  let sessionPid: number | null = null;
  let lastPresent: Cs2ProcessTrackingSnapshot["present"];

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
        },
      });
      sessionPid = pid;
    } catch {
      presentSession = null;
      sessionPid = null;
      lastPresent = undefined;
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

        listener({
          running: true,
          pid,
          os,
          gpu,
          present: lastPresent,
        });
        lastIdleKey = key;
      } else {
        await tearDownPresent();
        if (cancelled) return;

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

import type { Cs2ProcessStatus } from "@cs2helper/performance-processor";
import type { UseCase } from "@cs2helper/shared";
import type { Cs2ProcessStatusProbePort } from "../ports/Cs2ProcessStatusProbePort";

const DEFAULT_INTERVAL_MS = 1500;

export interface SubscribeCs2ProcessStatusOptions {
  /** Poll cadence in milliseconds. Defaults to 1500ms. */
  intervalMs?: number;
}

/**
 * Polls CS2 process state on a cadence and emits when `running` or `pid` changes.
 *
 * Returns an unsubscribe handle that cancels the polling loop.
 *
 * Ports tuple order: `[probe]`.
 */
export const subscribeCs2ProcessStatus: UseCase<
  [Cs2ProcessStatusProbePort],
  [listener: (status: Cs2ProcessStatus) => void, options?: SubscribeCs2ProcessStatusOptions],
  () => void
> = (ports, listener, options) => {
  const [probe] = ports;
  const intervalMs = options?.intervalMs ?? DEFAULT_INTERVAL_MS;
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let last: Cs2ProcessStatus | null = null;

  const tick = async (): Promise<void> => {
    if (cancelled) return;
    try {
      const next = await probe.getCs2ProcessStatus();
      if (cancelled) return;
      if (!last || last.running !== next.running || last.pid !== next.pid) {
        last = next;
        listener(next);
      }
    } catch {
      // Keep last snapshot until the next successful tick (same as Steam polling).
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
  };
};

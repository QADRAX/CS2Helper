import type { UseCase } from "@cs2helper/shared";
import type { Cs2ProcessPort, Cs2ProcessStatus } from "../ports/Cs2ProcessPort";

const DEFAULT_INTERVAL_MS = 2000;

export interface SubscribeCs2StatusPorts {
  cs2Process: Cs2ProcessPort;
}

export interface SubscribeCs2StatusOptions {
  /** Poll cadence in milliseconds. Defaults to 2000ms. */
  intervalMs?: number;
}

/**
 * Polls the CS2 process port at a fixed cadence and pushes status snapshots
 * to the listener. Consecutive identical snapshots are filtered out so the
 * presentation layer only re-renders on real transitions.
 *
 * Returns an unsubscribe handle that cancels the polling loop.
 */
export const subscribeCs2Status: UseCase<
  SubscribeCs2StatusPorts,
  [listener: (status: Cs2ProcessStatus) => void, options?: SubscribeCs2StatusOptions],
  () => void
> = ({ cs2Process }, listener, options) => {
  const intervalMs = options?.intervalMs ?? DEFAULT_INTERVAL_MS;
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let last: Cs2ProcessStatus | null = null;

  const tick = async (): Promise<void> => {
    if (cancelled) return;
    try {
      const next = await cs2Process.getStatus();
      if (cancelled) return;
      if (!last || last.running !== next.running || last.pid !== next.pid) {
        last = next;
        listener(next);
      }
    } catch {
      // Polling failures are silently swallowed; the listener keeps the
      // previous snapshot until the next successful tick.
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

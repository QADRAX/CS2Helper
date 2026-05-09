import type { UseCase } from "@cs2helper/shared";
import type { SteamInstallLocatorPort } from "../ports/SteamInstallLocatorPort";
import type { SteamProcessPort } from "../ports/SteamProcessPort";
import { getSteamStatus, type SteamStatus } from "./getSteamStatus";

const DEFAULT_INTERVAL_MS = 2000;

export interface SubscribeSteamStatusOptions {
  /** Poll cadence in milliseconds. Defaults to 2000ms. */
  intervalMs?: number;
}

/**
 * Polls Steam install + process state on a cadence and emits a combined
 * `SteamStatus` snapshot to the listener whenever any field changes.
 *
 * Returns an unsubscribe handle that cancels the polling loop.
 *
 * Ports tuple order: `[steamInstall, steamProcess]`.
 */
export const subscribeSteamStatus: UseCase<
  [SteamInstallLocatorPort, SteamProcessPort],
  [listener: (status: SteamStatus) => void, options?: SubscribeSteamStatusOptions],
  () => void
> = (ports, listener, options) => {
  const intervalMs = options?.intervalMs ?? DEFAULT_INTERVAL_MS;
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let last: SteamStatus | null = null;

  const tick = async (): Promise<void> => {
    if (cancelled) return;
    try {
      const next = await getSteamStatus(ports);
      if (cancelled) return;
      if (!last || hasChanged(last, next)) {
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

const hasChanged = (a: SteamStatus, b: SteamStatus): boolean => {
  if (a.installed !== b.installed) return true;
  if (a.running !== b.running) return true;
  if (a.pid !== b.pid) return true;
  const aPath = a.location?.steamExePath;
  const bPath = b.location?.steamExePath;
  return aPath !== bPath;
};

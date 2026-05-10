import type { Cs2ProcessTrackingSnapshot } from "@cs2helper/performance-processor";
import type { TickSourcePort } from "@cs2helper/tick-hub";

export function createPerformanceTickSource(
  alignToExternalTick: () => Promise<void>,
  getLastSnapshot: () => Cs2ProcessTrackingSnapshot | undefined
): TickSourcePort {
  return {
    id: "performance",
    async captureOnTick() {
      await alignToExternalTick();
      return getLastSnapshot();
    },
  };
}

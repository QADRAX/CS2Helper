import type { Cs2ProcessTrackingSnapshot } from "@cs2helper/performance-processor";
import type { TickSourcePort } from "@cs2helper/tick-hub";

export class PerformanceAlignmentTickSource implements TickSourcePort {
  readonly id = "performance";

  /**
   * @param scheduleAlign - non-blocking enqueue (serialized in performance session); tick hub stays responsive.
   */
  constructor(
    private readonly scheduleAlign: () => void,
    private readonly getLastSnapshot: () => Cs2ProcessTrackingSnapshot | undefined
  ) {}

  async captureOnTick(): Promise<unknown> {
    this.scheduleAlign();
    return this.getLastSnapshot() ?? { running: false };
  }
}

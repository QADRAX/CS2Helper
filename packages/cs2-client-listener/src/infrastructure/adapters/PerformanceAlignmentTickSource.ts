import type { Cs2ProcessTrackingSnapshot } from "@cs2helper/performance-processor";
import type { TickSourcePort } from "@cs2helper/tick-hub";

export class PerformanceAlignmentTickSource implements TickSourcePort {
  readonly id = "performance";

  constructor(
    private readonly alignToExternalTick: () => Promise<void>,
    private readonly getLastSnapshot: () => Cs2ProcessTrackingSnapshot | undefined
  ) {}

  async captureOnTick(): Promise<unknown> {
    await this.alignToExternalTick();
    return this.getLastSnapshot();
  }
}

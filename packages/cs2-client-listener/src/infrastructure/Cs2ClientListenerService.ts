import type { GsiGateway } from "@cs2helper/gsi-gateway";
import type {
  Cs2PerformanceApi,
  Cs2ProcessTrackingAlignmentSubscription,
  Cs2ProcessTrackingPollOptions,
  Cs2ProcessTrackingSnapshot,
} from "@cs2helper/performance-processor";
import {
  TickHubService,
  type TickFrame,
  type TickHubOptions,
  type TickRecordingPort,
  type TickSourcePort,
  type TickSourcesPort,
} from "@cs2helper/tick-hub";
import { createGsiMasterClockPort } from "./adapters/gsiMasterClockPort";
import { createPerformanceTickSource } from "./adapters/performanceTickSource";

export interface Cs2ClientListenerOptions {
  /** Passed to `subscribeCs2ProcessTrackingForAlignment` (align + poll cadence). */
  performancePoll?: Cs2ProcessTrackingPollOptions;
  /** Extra {@link TickSourcePort}s (mic, keyboard, …). */
  extraSources?: TickSourcePort[];
  /** Options for the inner {@link TickHubService}. */
  tickHub?: TickHubOptions;
}

/**
 * Composition root: `GsiGateway` as master clock + aligned `Cs2PerformanceApi` snapshot
 * on each tick, optional extension sources, same recording API as {@link TickHubService}.
 */
export class Cs2ClientListenerService {
  private readonly hub: TickHubService;
  private readonly sourcesPort: TickSourcesPort;
  private perfSub: Cs2ProcessTrackingAlignmentSubscription | null = null;
  private lastPerf?: Cs2ProcessTrackingSnapshot;
  private innerUnsub: (() => void) | undefined;

  readonly startTickRecording: (sink: TickRecordingPort) => void;
  readonly stopTickRecording: () => Promise<void>;

  constructor(
    gateway: GsiGateway,
    private readonly performance: Cs2PerformanceApi,
    private readonly options: Cs2ClientListenerOptions = {}
  ) {
    const master = createGsiMasterClockPort(gateway);
    this.sourcesPort = {
      getSources: () => this.buildSources(),
    };
    this.hub = new TickHubService(master, this.sourcesPort, options.tickHub ?? {});
    this.startTickRecording = this.hub.startTickRecording.bind(this.hub);
    this.stopTickRecording = this.hub.stopTickRecording.bind(this.hub);
  }

  private buildSources(): readonly TickSourcePort[] {
    const extra = this.options.extraSources ?? [];
    if (!this.perfSub) {
      return extra;
    }
    return [
      createPerformanceTickSource(
        () => this.perfSub!.alignToExternalTick(),
        () => this.lastPerf
      ),
      ...extra,
    ];
  }

  /**
   * Subscribes to combined ticks. Starts performance alignment subscription; call the returned
   * function to stop both hub and performance subscriptions.
   */
  subscribeTickFrames(listener: (frame: TickFrame) => void): () => void {
    this.innerUnsub?.();
    this.perfSub?.unsubscribe();
    this.perfSub = null;
    this.lastPerf = undefined;

    this.perfSub = this.performance.subscribeCs2ProcessTrackingForAlignment(
      (snapshot) => {
        this.lastPerf = snapshot;
      },
      this.options.performancePoll
    );

    this.innerUnsub = this.hub.subscribeTickFrames(listener);

    return () => {
      this.innerUnsub?.();
      this.innerUnsub = undefined;
      this.perfSub?.unsubscribe();
      this.perfSub = null;
    };
  }
}

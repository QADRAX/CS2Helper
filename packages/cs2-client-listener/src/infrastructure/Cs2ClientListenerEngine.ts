import {
  GsiGatewayService,
  type GsiGatewayDiagnostics,
  type GsiGatewayOptions,
} from "@cs2helper/gsi-gateway";
import {
  PerformanceProcessorService,
  type Cs2ProcessTrackingAlignmentSubscription,
  type Cs2ProcessTrackingPollOptions,
  type Cs2ProcessTrackingSnapshot,
  type PresentMonBootstrapOptions,
} from "@cs2helper/performance-processor";
import type { PowerShellCommandPort } from "@cs2helper/shared";
import {
  TickHubService,
  type TickFrame,
  type TickHubOptions,
  type TickSourcePort,
} from "@cs2helper/tick-hub";
import { Cs2ClientListenerNotRunningError } from "../domain/cs2ClientListenerErrors";
import type { Cs2ClientListenerStartResult } from "../domain/cs2ClientListenerStartResult";
import { GsiGatewayMasterClock } from "./adapters/GsiGatewayMasterClock";
import { PerformanceAlignmentTickSource } from "./adapters/PerformanceAlignmentTickSource";

export interface Cs2ClientListenerOptions {
  gateway?: GsiGatewayOptions;
  performancePoll?: Cs2ProcessTrackingPollOptions;
  tickHub?: TickHubOptions;
}

/**
 * Mutable runtime for the CS2 listener (gateway, performance, hub, subscriptions).
 * Used by {@link Cs2ClientListenerService} and {@link Cs2ClientListenerControlAdapter}.
 */
export class Cs2ClientListenerEngine {
  private gateway: GsiGatewayService | null = null;
  private readonly performance: PerformanceProcessorService;
  private hub: TickHubService | null = null;
  private readonly sourcesPort = {
    getSources: () => this.buildSources(),
  };
  private perfSub: Cs2ProcessTrackingAlignmentSubscription | null = null;
  private lastPerf?: Cs2ProcessTrackingSnapshot;
  private innerUnsub: (() => void) | undefined;

  constructor(
    private readonly powershell: PowerShellCommandPort,
    private readonly options: Cs2ClientListenerOptions = {}
  ) {
    this.performance = new PerformanceProcessorService({
      powershell: this.powershell,
      defaultSubscribeCs2ProcessTrackingOptions: this.options.performancePoll,
    });
  }

  isRunning(): boolean {
    return this.gateway !== null;
  }

  getGatewayDiagnostics(): Readonly<GsiGatewayDiagnostics> {
    if (!this.gateway) {
      return { receivedRequests: 0, rejectedRequests: 0 };
    }
    return this.gateway.getDiagnostics();
  }

  ensurePresentMonBootstrap(options?: PresentMonBootstrapOptions): Promise<void> {
    return this.performance.ensurePresentMonBootstrap(options);
  }

  async enterRunningMode(gatewayOptions?: GsiGatewayOptions): Promise<Cs2ClientListenerStartResult> {
    const gw = new GsiGatewayService({
      ...(this.options.gateway ?? {}),
      ...(gatewayOptions ?? {}),
    });
    try {
      const { port } = await gw.start();
      const hub = new TickHubService(
        new GsiGatewayMasterClock(gw),
        this.sourcesPort,
        this.options.tickHub ?? {}
      );
      this.gateway = gw;
      this.hub = hub;
      return { gatewayPort: port };
    } catch (err) {
      await gw.stop().catch(() => {
        /* best-effort */
      });
      throw err;
    }
  }

  async exitRunningMode(): Promise<void> {
    this.innerUnsub?.();
    this.innerUnsub = undefined;
    this.perfSub?.unsubscribe();
    this.perfSub = null;
    this.lastPerf = undefined;

    if (this.gateway) {
      await this.gateway.stop();
    }
    this.gateway = null;
    this.hub = null;
  }

  startRecording(filePath: string): void {
    this.requireRunning();
    this.hub!.startRecording(filePath);
    if (!this.innerUnsub) {
      this.attachTickPipeline(() => {});
    }
  }

  async stopRecording(): Promise<void> {
    if (!this.hub) {
      return;
    }
    await this.hub.stopRecording();
  }

  subscribeTickFrames(listener: (frame: TickFrame) => void): () => void {
    this.requireRunning();
    this.innerUnsub?.();
    this.perfSub?.unsubscribe();
    this.perfSub = null;
    this.lastPerf = undefined;
    this.attachTickPipeline(listener);

    return () => {
      this.innerUnsub?.();
      this.innerUnsub = undefined;
      this.perfSub?.unsubscribe();
      this.perfSub = null;
    };
  }

  private attachTickPipeline(listener: (frame: TickFrame) => void): void {
    this.perfSub = this.performance.subscribeCs2ProcessTrackingForAlignment(
      (snapshot) => {
        this.lastPerf = snapshot;
      },
      this.options.performancePoll
    );
    this.innerUnsub = this.hub!.subscribeTickFrames(listener);
  }

  private requireRunning(): void {
    if (!this.isRunning() || !this.hub) {
      throw new Cs2ClientListenerNotRunningError();
    }
  }

  private buildSources(): readonly TickSourcePort[] {
    if (!this.perfSub) {
      return [];
    }
    return [
      new PerformanceAlignmentTickSource(
        () => this.perfSub!.alignToExternalTick(),
        () => this.lastPerf
      ),
    ];
  }
}

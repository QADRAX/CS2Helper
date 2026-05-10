import { withPortsAsync, type PowerShellCommandPort } from "@cs2helper/shared";
import type { PresentMonBootstrapOptions } from "../application/ports/PresentMonBootstrapPort";
import { ensurePresentMonBootstrap } from "../application/useCases/ensurePresentMonBootstrap";
import { getCs2Status } from "../application/useCases/getCs2Status";
import { subscribeCs2ProcessTracking } from "../application/useCases/subscribeCs2ProcessTracking";
import type { Cs2ProcessStatus, Cs2ProcessTrackingSnapshot } from "../domain/telemetry/cs2Process";
import type { Cs2ProcessTrackingPollOptions } from "../domain/telemetry/cs2ProcessTrackingPoll";
import { ManagedPresentMonBootstrapAdapter } from "./adapters/ManagedPresentMonBootstrapAdapter";
import { TasklistCs2ProcessAdapter } from "./adapters/TasklistCs2ProcessAdapter";
import {
  PresentMonPresentChainMetricsAdapter,
  WindowsCimOsProcessMetricsAdapter,
  WindowsCounterGpuProcessMetricsAdapter,
} from "./adapters/telemetry";

export interface PerformanceProcessorServiceOptions {
  /** PowerShell runner for CIM/GPU counter adapters (e.g. gsi-cli `CliAppService`). */
  powershell: PowerShellCommandPort;
  /**
   * Defaults merged into each `subscribeCs2ProcessTracking` call (per-subscription options override).
   * Use this to align process poll, system metrics, and present/FPS notification cadences app-wide.
   */
  defaultSubscribeCs2ProcessTrackingOptions?: Cs2ProcessTrackingPollOptions;
}

/**
 * Operations the host CLI exposes for CS2 performance / process telemetry.
 */
export interface Cs2PerformanceApi {
  getCs2Status: () => Promise<Cs2ProcessStatus>;
  subscribeCs2ProcessTracking: (
    listener: (snapshot: Cs2ProcessTrackingSnapshot) => void,
    options?: Cs2ProcessTrackingPollOptions
  ) => () => void;
  ensurePresentMonBootstrap: (options?: PresentMonBootstrapOptions) => Promise<void>;
}

/**
 * Composition root: wires CS2 performance use cases to Windows telemetry adapters.
 */
export class PerformanceProcessorService implements Cs2PerformanceApi {
  private readonly cs2ProcessPort: TasklistCs2ProcessAdapter;
  private readonly osProcessMetricsPort: WindowsCimOsProcessMetricsAdapter;
  private readonly gpuProcessMetricsPort: WindowsCounterGpuProcessMetricsAdapter;
  private readonly presentChainMetricsPort: PresentMonPresentChainMetricsAdapter;
  private readonly presentMonBootstrap: ManagedPresentMonBootstrapAdapter;
  private readonly defaultSubscribeCs2: Cs2ProcessTrackingPollOptions | undefined;

  getCs2Status: () => Promise<Cs2ProcessStatus>;
  subscribeCs2ProcessTracking: (
    listener: (snapshot: Cs2ProcessTrackingSnapshot) => void,
    options?: Cs2ProcessTrackingPollOptions
  ) => () => void;
  ensurePresentMonBootstrap: (options?: PresentMonBootstrapOptions) => Promise<void>;

  constructor(options: PerformanceProcessorServiceOptions) {
    this.defaultSubscribeCs2 = options.defaultSubscribeCs2ProcessTrackingOptions;
    this.cs2ProcessPort = new TasklistCs2ProcessAdapter();
    this.osProcessMetricsPort = new WindowsCimOsProcessMetricsAdapter(options.powershell);
    this.gpuProcessMetricsPort = new WindowsCounterGpuProcessMetricsAdapter(options.powershell);
    this.presentMonBootstrap = new ManagedPresentMonBootstrapAdapter();
    this.presentChainMetricsPort = new PresentMonPresentChainMetricsAdapter();

    this.getCs2Status = withPortsAsync(getCs2Status, [this.cs2ProcessPort]);
    this.subscribeCs2ProcessTracking = (listener, opts) =>
      subscribeCs2ProcessTracking(
        [
          this.cs2ProcessPort,
          this.osProcessMetricsPort,
          this.gpuProcessMetricsPort,
          this.presentChainMetricsPort,
        ],
        listener,
        { ...this.defaultSubscribeCs2, ...opts }
      );
    this.ensurePresentMonBootstrap = withPortsAsync(ensurePresentMonBootstrap, [
      this.presentMonBootstrap,
    ]);
  }
}

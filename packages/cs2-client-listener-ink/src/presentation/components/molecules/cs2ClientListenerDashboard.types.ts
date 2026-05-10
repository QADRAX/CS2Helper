import type { TickFrame } from "@cs2helper/tick-hub";

/** HTTP ingest counters for the embedded GSI gateway (shown on the stream tab). */
export interface ClientListenerGatewayCounters {
  receivedRequests: number;
  rejectedRequests: number;
  lastRejectReason?: string;
}

/** Labels used by the CS2 client listener Ink dashboard. */
export interface Cs2ClientListenerDashboardLabels {
  title: string;
  warningPrefix: string;
  spinner: (frame: string) => string;
  /** Stream tab: GSI processor + gateway. */
  tabStream: string;
  /** Game tab: match / HUD / provider. */
  tabGame: string;
  /** Performance tab: CPU / GPU / FPS from tick `sources.performance`. */
  tabPerformance: string;
  tabSwitchHint: string;
  streamState: string;
  ticksReceived: string;
  lastTickAt: string;
  httpRequests: string;
  httpRejected: string;
  lastRejectReason: string;
  watcherMode: string;
  lastGameState: string;
  payloadKindClientLocal: string;
  payloadKindSpectatorHltv: string;
  payloadKindDedicatedServer: string;
  valueAvailable: string;
  valueNull: string;
  valueNone: string;
  yes: string;
  no: string;
  /** Row labels for the GSI `provider` block (game tab). */
  providerHeading: string;
  providerGame: string;
  providerGsiTime: string;
  /** Aggregated match / HUD context (game tab). */
  matchSummary: string;
  matchScore: string;
  playerHudControl: string;
  playerHudControlLocal: string;
  playerHudControlSpectate: string;
  playerHudPov: string;
  /** Performance tab rows. */
  perfProcessRunning: string;
  perfProcessPid: string;
  perfCpuPercent: string;
  perfWorkingSetMb: string;
  perfGpuUtilization: string;
  perfGpuDedicatedMb: string;
  perfGpuSharedMb: string;
  perfFpsSmoothed: string;
  perfFrametimeMs: string;
  perfPresentChainError: string;
}

/** Props for the shared Ink CS2 client listener dashboard (live or replayed ticks). */
export interface Cs2ClientListenerDashboardProps {
  /** Latest assembled tick (`TickFrame` from `@cs2helper/tick-hub` / `cs2-client-listener`). */
  tickFrame: TickFrame | null;
  gatewayDiagnostics: ClientListenerGatewayCounters;
  cs2Running: boolean;
  labels: Cs2ClientListenerDashboardLabels;
  gatewayWarning?: string;
  formatTimestamp?: (timestamp: number) => string;
  /** Passed to `Intl` when formatting `provider.timestamp` (GSI clock). */
  providerTimeLocale?: Intl.LocalesArgument;
}

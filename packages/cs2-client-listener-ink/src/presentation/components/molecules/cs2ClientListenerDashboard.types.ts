import type { TickFrame } from "@cs2helper/tick-hub";

/** Gateway counters displayed next to the processor state. */
export interface GsiGatewayDiagnosticsView {
  receivedRequests: number;
  rejectedRequests: number;
  lastRejectReason?: string;
}

/** Labels used by the CS2 client listener Ink dashboard. */
export interface Cs2ClientListenerDashboardLabels {
  title: string;
  warningPrefix: string;
  spinner: (frame: string) => string;
  tabProcessing: string;
  tabGameState: string;
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
}

/** Props for the shared Ink CS2 client listener dashboard (live or replayed ticks). */
export interface Cs2ClientListenerDashboardProps {
  /** Latest assembled tick (`TickFrame` from `@cs2helper/tick-hub` / `cs2-client-listener`). */
  tickFrame: TickFrame | null;
  gatewayDiagnostics: GsiGatewayDiagnosticsView;
  cs2Running: boolean;
  labels: Cs2ClientListenerDashboardLabels;
  gatewayWarning?: string;
  formatTimestamp?: (timestamp: number) => string;
  /** Passed to `Intl` when formatting `provider.timestamp` (GSI clock). */
  providerTimeLocale?: Intl.LocalesArgument;
}

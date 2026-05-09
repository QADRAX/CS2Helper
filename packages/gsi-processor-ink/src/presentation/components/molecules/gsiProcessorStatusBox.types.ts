import type { GsiProcessorState } from "@cs2helper/gsi-processor";

/** Gateway counters displayed next to the processor state. */
export interface GsiGatewayDiagnosticsView {
  receivedRequests: number;
  rejectedRequests: number;
  lastRejectReason?: string;
}

/** Labels used by the terminal processor status component. */
export interface GsiProcessorStatusLabels {
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

/** Props for the shared Ink GSI processor status panel. */
export interface GsiProcessorStatusBoxProps {
  gsiState: Readonly<GsiProcessorState> | null;
  gatewayDiagnostics: GsiGatewayDiagnosticsView;
  cs2Running: boolean;
  labels: GsiProcessorStatusLabels;
  gatewayWarning?: string;
  formatTimestamp?: (timestamp: number) => string;
  /** Passed to `Intl` when formatting `provider.timestamp` (GSI clock). */
  providerTimeLocale?: Intl.LocalesArgument;
}

import type { Cs2ClientListenerDashboardLabels } from "../components/molecules/cs2ClientListenerDashboard.types";

/** Label slots that render as column headers (excludes `spinner`, which is a formatter function). */
export type GsiDashboardLabelKey = Exclude<keyof Cs2ClientListenerDashboardLabels, "spinner">;

/** Dashboard tab strip (Processing vs Game state). */
export type GsiDashboardRegistryTab = "processing" | "gameState";

/** Panel within a tab: main grid rows or GSI `provider` subsection. */
export type GsiDashboardRegistryPanel = "main" | "provider";

export interface GsiDashboardFieldPlacement {
  tab: GsiDashboardRegistryTab;
  panel: GsiDashboardRegistryPanel;
}

/**
 * Top-level scalar fields on {@link GsiProcessorState} shown in the Processing tab.
 * See `@cs2helper/gsi-processor` `GsiProcessorState`.
 */
export type GsiDashboardStateScalarKey = "streamState" | "totalTicks" | "lastProcessedAt";

/** Fields on {@link GsiGatewayDiagnosticsView}. */
export type GsiDashboardGatewayKey = "receivedRequests" | "rejectedRequests" | "lastRejectReason";

/**
 * Values derived from multiple sources (`lastSnapshot`, payload, labels).
 * Document the primary domain touchpoint in JSDoc on each registry row.
 */
export type GsiDashboardComputedBindingId =
  | "lastGameStateAvailability"
  | "watcherModeEffective"
  | "matchSummaryLine"
  | "matchScoreLine"
  | "hudControlLabel"
  | "hudPovLine"
  | "providerNameAppBuildLine"
  | "providerGsiClock";

export type GsiDashboardDataBinding =
  | { kind: "state"; key: GsiDashboardStateScalarKey }
  | { kind: "gateway"; key: GsiDashboardGatewayKey }
  | { kind: "computed"; id: GsiDashboardComputedBindingId };

/**
 * How the raw resolved value is turned into display text.
 * Maps to helpers in `formatGsiProvider` / `gsiStatusDashboardFormat`.
 */
export type GsiDashboardPresentKind =
  | "identity"
  | "timestamp"
  | "watcherMode"
  | "matchSummary"
  | "matchScore"
  | "hudPov"
  | "gsiClock"
  | "providerGameLine";

/**
 * Single dashboard row definition: stable id, UI placement, label slot on
 * {@link Cs2ClientListenerDashboardLabels}, data binding, and presentation strategy.
 */
export interface GsiDashboardFieldDefinition {
  /** Stable key for tests and documentation. */
  id: string;
  placement: GsiDashboardFieldPlacement;
  /** Resolved copy slot (gsi-cli i18n / bench literals pass strings here). */
  labelKey: GsiDashboardLabelKey;
  binding: GsiDashboardDataBinding;
  present: GsiDashboardPresentKind;
  /**
   * Optional pointer to domain concepts (processor state / snapshot), for maintainers.
   * Not used at runtime.
   */
  doc?: string;
}

/** Processing tab — stream health + gateway counters. */
export const GSI_DASHBOARD_PROCESSING_FIELDS = [
  {
    id: "stream_state",
    placement: { tab: "processing", panel: "main" },
    labelKey: "streamState",
    binding: { kind: "state", key: "streamState" },
    present: "identity",
    doc: "GsiProcessorState.streamState",
  },
  {
    id: "ticks_received",
    placement: { tab: "processing", panel: "main" },
    labelKey: "ticksReceived",
    binding: { kind: "state", key: "totalTicks" },
    present: "identity",
    doc: "GsiProcessorState.totalTicks",
  },
  {
    id: "last_tick_at",
    placement: { tab: "processing", panel: "main" },
    labelKey: "lastTickAt",
    binding: { kind: "state", key: "lastProcessedAt" },
    present: "timestamp",
    doc: "GsiProcessorState.lastProcessedAt",
  },
  {
    id: "http_requests",
    placement: { tab: "processing", panel: "main" },
    labelKey: "httpRequests",
    binding: { kind: "gateway", key: "receivedRequests" },
    present: "identity",
    doc: "GsiGatewayDiagnosticsView.receivedRequests",
  },
  {
    id: "http_rejected",
    placement: { tab: "processing", panel: "main" },
    labelKey: "httpRejected",
    binding: { kind: "gateway", key: "rejectedRequests" },
    present: "identity",
    doc: "GsiGatewayDiagnosticsView.rejectedRequests",
  },
  {
    id: "last_reject_reason",
    placement: { tab: "processing", panel: "main" },
    labelKey: "lastRejectReason",
    binding: { kind: "gateway", key: "lastRejectReason" },
    present: "identity",
    doc: "GsiGatewayDiagnosticsView.lastRejectReason",
  },
] as const satisfies readonly GsiDashboardFieldDefinition[];

/** Game state tab — payload summary, match projection, HUD context. */
export const GSI_DASHBOARD_GAME_STATE_FIELDS = [
  {
    id: "last_game_state",
    placement: { tab: "gameState", panel: "main" },
    labelKey: "lastGameState",
    binding: { kind: "computed", id: "lastGameStateAvailability" },
    present: "identity",
    doc: "GsiProcessorState.lastGameState (availability)",
  },
  {
    id: "watcher_mode",
    placement: { tab: "gameState", panel: "main" },
    labelKey: "watcherMode",
    binding: { kind: "computed", id: "watcherModeEffective" },
    present: "watcherMode",
    doc: "GsiProcessorState.watcherMode | payload.watcherMode",
  },
  {
    id: "match_summary",
    placement: { tab: "gameState", panel: "main" },
    labelKey: "matchSummary",
    binding: { kind: "computed", id: "matchSummaryLine" },
    present: "matchSummary",
    doc: "GsiProcessorState.lastSnapshot.map",
  },
  {
    id: "match_score",
    placement: { tab: "gameState", panel: "main" },
    labelKey: "matchScore",
    binding: { kind: "computed", id: "matchScoreLine" },
    present: "matchScore",
    doc: "GsiProcessorState.lastSnapshot.map team scores",
  },
  {
    id: "player_hud_control",
    placement: { tab: "gameState", panel: "main" },
    labelKey: "playerHudControl",
    binding: { kind: "computed", id: "hudControlLabel" },
    present: "identity",
    doc: "GsiProcessorState.isSpectatingOtherPlayer + labels",
  },
  {
    id: "player_hud_pov",
    placement: { tab: "gameState", panel: "main" },
    labelKey: "playerHudPov",
    binding: { kind: "computed", id: "hudPovLine" },
    present: "hudPov",
    doc: "GsiProcessorState.focusedPlayerSteamId + playersBySteamId",
  },
] as const satisfies readonly GsiDashboardFieldDefinition[];

/** GSI `provider` subsection under Game state (only rendered when provider exists). */
export const GSI_DASHBOARD_PROVIDER_FIELDS = [
  {
    id: "provider_game_app_build",
    placement: { tab: "gameState", panel: "provider" },
    labelKey: "providerGame",
    binding: { kind: "computed", id: "providerNameAppBuildLine" },
    present: "providerGameLine",
    doc: "NormalizedSnapshot.provider | lastGameState.provider",
  },
  {
    id: "provider_gsi_clock",
    placement: { tab: "gameState", panel: "provider" },
    labelKey: "providerGsiTime",
    binding: { kind: "computed", id: "providerGsiClock" },
    present: "gsiClock",
    doc: "WatcherProvider.timestamp",
  },
] as const satisfies readonly GsiDashboardFieldDefinition[];

/** Full registry in UI order (processing, then game main, then provider). */
export const GSI_DASHBOARD_ALL_FIELDS: readonly GsiDashboardFieldDefinition[] = [
  ...GSI_DASHBOARD_PROCESSING_FIELDS,
  ...GSI_DASHBOARD_GAME_STATE_FIELDS,
  ...GSI_DASHBOARD_PROVIDER_FIELDS,
];

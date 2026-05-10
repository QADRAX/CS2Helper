import type { Cs2ClientListenerDashboardLabels } from "../components/molecules/cs2ClientListenerDashboard.types";

/** Label slots that render as column headers (excludes `spinner`, which is a formatter function). */
export type ClientListenerDashboardLabelKey = Exclude<keyof Cs2ClientListenerDashboardLabels, "spinner">;

/**
 * Dashboard tab: stream (GSI + HTTP gateway), game payload, or performance telemetry
 * from the tick hub `sources.performance` slice.
 */
export type ClientListenerDashboardRegistryTab = "stream" | "game" | "performance";

/** Panel within a tab: main grid or optional `provider` subsection (game tab only). */
export type ClientListenerDashboardRegistryPanel = "main" | "provider";

export interface ClientListenerDashboardFieldPlacement {
  tab: ClientListenerDashboardRegistryTab;
  panel: ClientListenerDashboardRegistryPanel;
}

/**
 * Top-level scalar fields on `GsiProcessorState` (stream tab).
 * See `@cs2helper/gsi-processor` `GsiProcessorState`.
 */
export type ClientListenerDashboardStateScalarKey = "streamState" | "totalTicks" | "lastProcessedAt";

/** Fields on HTTP gateway counters (ingest diagnostics). */
export type ClientListenerDashboardGatewayKey = "receivedRequests" | "rejectedRequests" | "lastRejectReason";

/** Performance snapshot fields (`TickFrame.sources.performance`). */
export type ClientListenerDashboardPerformanceKey =
  | "processRunning"
  | "processPid"
  | "presentChainError"
  | "cpuPercent"
  | "workingSetMb"
  | "gpuUtilizationPercent"
  | "gpuDedicatedMb"
  | "gpuSharedMb"
  | "fpsSmoothed"
  | "frametimeMs";

/**
 * Values derived from multiple sources (`lastSnapshot`, payload, labels).
 * Document the primary domain touchpoint in JSDoc on each registry row.
 */
export type ClientListenerDashboardComputedBindingId =
  | "lastGameStateAvailability"
  | "watcherModeEffective"
  | "matchSummaryLine"
  | "matchScoreLine"
  | "hudControlLabel"
  | "hudPovLine"
  | "providerNameAppBuildLine"
  | "providerGsiClock";

export type ClientListenerDashboardDataBinding =
  | { kind: "state"; key: ClientListenerDashboardStateScalarKey }
  | { kind: "gateway"; key: ClientListenerDashboardGatewayKey }
  | { kind: "performance"; key: ClientListenerDashboardPerformanceKey }
  | { kind: "computed"; id: ClientListenerDashboardComputedBindingId };

/**
 * How the raw resolved value is turned into display text.
 * Maps to helpers in `formatGsiProvider` / `gsiStatusDashboardFormat`.
 */
export type ClientListenerDashboardPresentKind =
  | "identity"
  | "timestamp"
  | "watcherMode"
  | "matchSummary"
  | "matchScore"
  | "hudPov"
  | "gsiClock"
  | "providerGameLine"
  | "yesNo";

/**
 * Single dashboard row: stable id, placement, label slot on
 * {@link Cs2ClientListenerDashboardLabels}, binding, and presentation strategy.
 */
export interface ClientListenerDashboardFieldDefinition {
  id: string;
  placement: ClientListenerDashboardFieldPlacement;
  labelKey: ClientListenerDashboardLabelKey;
  binding: ClientListenerDashboardDataBinding;
  present: ClientListenerDashboardPresentKind;
  /** Not used at runtime; for maintainers. */
  doc?: string;
}

/** Stream tab — GSI processor health + HTTP gateway counters. */
export const CLIENT_LISTENER_DASHBOARD_STREAM_FIELDS = [
  {
    id: "stream_state",
    placement: { tab: "stream", panel: "main" },
    labelKey: "streamState",
    binding: { kind: "state", key: "streamState" },
    present: "identity",
    doc: "GsiProcessorState.streamState",
  },
  {
    id: "ticks_received",
    placement: { tab: "stream", panel: "main" },
    labelKey: "ticksReceived",
    binding: { kind: "state", key: "totalTicks" },
    present: "identity",
    doc: "GsiProcessorState.totalTicks",
  },
  {
    id: "last_tick_at",
    placement: { tab: "stream", panel: "main" },
    labelKey: "lastTickAt",
    binding: { kind: "state", key: "lastProcessedAt" },
    present: "timestamp",
    doc: "GsiProcessorState.lastProcessedAt",
  },
  {
    id: "http_requests",
    placement: { tab: "stream", panel: "main" },
    labelKey: "httpRequests",
    binding: { kind: "gateway", key: "receivedRequests" },
    present: "identity",
    doc: "Gateway receivedRequests",
  },
  {
    id: "http_rejected",
    placement: { tab: "stream", panel: "main" },
    labelKey: "httpRejected",
    binding: { kind: "gateway", key: "rejectedRequests" },
    present: "identity",
    doc: "Gateway rejectedRequests",
  },
  {
    id: "last_reject_reason",
    placement: { tab: "stream", panel: "main" },
    labelKey: "lastRejectReason",
    binding: { kind: "gateway", key: "lastRejectReason" },
    present: "identity",
    doc: "Gateway lastRejectReason",
  },
] as const satisfies readonly ClientListenerDashboardFieldDefinition[];

/** Game tab — payload summary, match projection, HUD context. */
export const CLIENT_LISTENER_DASHBOARD_GAME_FIELDS = [
  {
    id: "last_game_state",
    placement: { tab: "game", panel: "main" },
    labelKey: "lastGameState",
    binding: { kind: "computed", id: "lastGameStateAvailability" },
    present: "identity",
    doc: "lastGameState availability",
  },
  {
    id: "watcher_mode",
    placement: { tab: "game", panel: "main" },
    labelKey: "watcherMode",
    binding: { kind: "computed", id: "watcherModeEffective" },
    present: "watcherMode",
    doc: "watcherMode",
  },
  {
    id: "match_summary",
    placement: { tab: "game", panel: "main" },
    labelKey: "matchSummary",
    binding: { kind: "computed", id: "matchSummaryLine" },
    present: "matchSummary",
    doc: "lastSnapshot.map",
  },
  {
    id: "match_score",
    placement: { tab: "game", panel: "main" },
    labelKey: "matchScore",
    binding: { kind: "computed", id: "matchScoreLine" },
    present: "matchScore",
    doc: "team scores",
  },
  {
    id: "player_hud_control",
    placement: { tab: "game", panel: "main" },
    labelKey: "playerHudControl",
    binding: { kind: "computed", id: "hudControlLabel" },
    present: "identity",
    doc: "spectating HUD label",
  },
  {
    id: "player_hud_pov",
    placement: { tab: "game", panel: "main" },
    labelKey: "playerHudPov",
    binding: { kind: "computed", id: "hudPovLine" },
    present: "hudPov",
    doc: "HUD POV line",
  },
] as const satisfies readonly ClientListenerDashboardFieldDefinition[];

/** Game `provider` subsection (only when provider exists). */
export const CLIENT_LISTENER_DASHBOARD_PROVIDER_FIELDS = [
  {
    id: "provider_game_app_build",
    placement: { tab: "game", panel: "provider" },
    labelKey: "providerGame",
    binding: { kind: "computed", id: "providerNameAppBuildLine" },
    present: "providerGameLine",
    doc: "WatcherProvider name/app/version",
  },
  {
    id: "provider_gsi_clock",
    placement: { tab: "game", panel: "provider" },
    labelKey: "providerGsiTime",
    binding: { kind: "computed", id: "providerGsiClock" },
    present: "gsiClock",
    doc: "WatcherProvider.timestamp",
  },
] as const satisfies readonly ClientListenerDashboardFieldDefinition[];

/** Performance tab — CPU / memory / GPU / PresentMon-style FPS (tick-aligned snapshot). */
export const CLIENT_LISTENER_DASHBOARD_PERFORMANCE_FIELDS = [
  {
    id: "perf_cs2_running",
    placement: { tab: "performance", panel: "main" },
    labelKey: "perfProcessRunning",
    binding: { kind: "performance", key: "processRunning" },
    present: "yesNo",
    doc: "Cs2ProcessTrackingSnapshot.running",
  },
  {
    id: "perf_pid",
    placement: { tab: "performance", panel: "main" },
    labelKey: "perfProcessPid",
    binding: { kind: "performance", key: "processPid" },
    present: "identity",
    doc: "Cs2ProcessTrackingSnapshot.pid",
  },
  {
    id: "perf_cpu_percent",
    placement: { tab: "performance", panel: "main" },
    labelKey: "perfCpuPercent",
    binding: { kind: "performance", key: "cpuPercent" },
    present: "identity",
    doc: "os.cpuPercent",
  },
  {
    id: "perf_working_set",
    placement: { tab: "performance", panel: "main" },
    labelKey: "perfWorkingSetMb",
    binding: { kind: "performance", key: "workingSetMb" },
    present: "identity",
    doc: "os.workingSetBytes",
  },
  {
    id: "perf_gpu_util",
    placement: { tab: "performance", panel: "main" },
    labelKey: "perfGpuUtilization",
    binding: { kind: "performance", key: "gpuUtilizationPercent" },
    present: "identity",
    doc: "gpu.gpuUtilizationPercent",
  },
  {
    id: "perf_gpu_dedicated_mb",
    placement: { tab: "performance", panel: "main" },
    labelKey: "perfGpuDedicatedMb",
    binding: { kind: "performance", key: "gpuDedicatedMb" },
    present: "identity",
    doc: "gpu.dedicatedMemoryBytes",
  },
  {
    id: "perf_gpu_shared_mb",
    placement: { tab: "performance", panel: "main" },
    labelKey: "perfGpuSharedMb",
    binding: { kind: "performance", key: "gpuSharedMb" },
    present: "identity",
    doc: "gpu.sharedMemoryBytes",
  },
  {
    id: "perf_fps",
    placement: { tab: "performance", panel: "main" },
    labelKey: "perfFpsSmoothed",
    binding: { kind: "performance", key: "fpsSmoothed" },
    present: "identity",
    doc: "present.fpsSmoothed",
  },
  {
    id: "perf_frametime",
    placement: { tab: "performance", panel: "main" },
    labelKey: "perfFrametimeMs",
    binding: { kind: "performance", key: "frametimeMs" },
    present: "identity",
    doc: "present.frametimeMs",
  },
  {
    id: "perf_present_error",
    placement: { tab: "performance", panel: "main" },
    labelKey: "perfPresentChainError",
    binding: { kind: "performance", key: "presentChainError" },
    present: "identity",
    doc: "presentChainError",
  },
] as const satisfies readonly ClientListenerDashboardFieldDefinition[];

/** Full registry in UI order. */
export const CLIENT_LISTENER_DASHBOARD_ALL_FIELDS: readonly ClientListenerDashboardFieldDefinition[] = [
  ...CLIENT_LISTENER_DASHBOARD_STREAM_FIELDS,
  ...CLIENT_LISTENER_DASHBOARD_GAME_FIELDS,
  ...CLIENT_LISTENER_DASHBOARD_PROVIDER_FIELDS,
  ...CLIENT_LISTENER_DASHBOARD_PERFORMANCE_FIELDS,
];

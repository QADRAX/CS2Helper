import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { HotkeyTabDescriptor } from "../components/atoms/hotkeyTabStrip";
import type { KeyValueRow } from "../components/atoms/gridRowList";
import { formatGsiProviderClockHuman, formatGsiProviderNameAppVersionLine } from "../utils/formatGsiProvider";
import {
  formatHudPovLine,
  formatMatchScoreLine,
  formatMatchSummaryLine,
  watcherModeDisplayValue,
} from "../utils/gsiStatusDashboardFormat";
import type { GsiGatewayDiagnosticsView, GsiProcessorStatusLabels } from "../components/molecules/gsiProcessorStatusBox.types";
import type {
  GsiDashboardContextValue,
  GsiDashboardGameStatePanelModel,
  GsiDashboardPanelModel,
  GsiDashboardTabIndex,
} from "./gsiDashboardTypes";

export interface GsiDashboardBuildInput {
  gsiState: Readonly<GsiProcessorState> | null;
  gatewayDiagnostics: GsiGatewayDiagnosticsView;
  cs2Running: boolean;
  labels: GsiProcessorStatusLabels;
  gatewayWarning?: string;
  formatTimestamp: (timestamp: number) => string;
  providerTimeLocale?: Intl.LocalesArgument;
  activeTab: GsiDashboardTabIndex;
  setActiveTab: (tab: GsiDashboardTabIndex) => void;
}

function selectHotkeyTabs(labels: GsiProcessorStatusLabels): readonly HotkeyTabDescriptor[] {
  return [
    { hotkey: "7", label: labels.tabProcessing },
    { hotkey: "8", label: labels.tabGameState },
  ];
}

function buildProcessingRows(
  gsiState: Readonly<GsiProcessorState> | null,
  labels: GsiProcessorStatusLabels,
  gatewayDiagnostics: GsiGatewayDiagnosticsView,
  formatTimestamp: (timestamp: number) => string
): KeyValueRow[] {
  const streamState = gsiState != null ? gsiState.streamState : "-";
  const totalTicks = gsiState?.totalTicks ?? 0;
  const lastProcessedAt = gsiState?.lastProcessedAt ?? null;
  return [
    { label: labels.streamState, value: String(streamState) },
    { label: labels.ticksReceived, value: String(totalTicks) },
    {
      label: labels.lastTickAt,
      value: lastProcessedAt ? formatTimestamp(lastProcessedAt) : "-",
    },
    { label: labels.httpRequests, value: String(gatewayDiagnostics.receivedRequests) },
    { label: labels.httpRejected, value: String(gatewayDiagnostics.rejectedRequests) },
    {
      label: labels.lastRejectReason,
      value: gatewayDiagnostics.lastRejectReason ?? "-",
    },
  ];
}

function buildGameStateRows(
  gsiState: Readonly<GsiProcessorState> | null,
  labels: GsiProcessorStatusLabels,
  payload: unknown
): KeyValueRow[] {
  const watcherMode = gsiState?.watcherMode ?? (payload as { watcherMode?: string } | null)?.watcherMode ?? null;
  const hudControl = gsiState?.isSpectatingOtherPlayer
    ? labels.playerHudControlSpectate
    : labels.playerHudControlLocal;
  return [
    {
      label: labels.lastGameState,
      value: payload ? labels.valueAvailable : labels.valueNull,
    },
    { label: labels.watcherMode, value: watcherModeDisplayValue(labels, watcherMode) },
    { label: labels.matchSummary, value: formatMatchSummaryLine(gsiState) },
    { label: labels.matchScore, value: formatMatchScoreLine(gsiState) },
    { label: labels.playerHudControl, value: hudControl },
    { label: labels.playerHudPov, value: formatHudPovLine(gsiState) },
  ];
}

function buildGameStatePanel(
  gsiState: Readonly<GsiProcessorState> | null,
  labels: GsiProcessorStatusLabels,
  providerTimeLocale: Intl.LocalesArgument | undefined
): GsiDashboardGameStatePanelModel {
  const payload = gsiState?.lastGameState ?? null;
  const provider = gsiState?.lastSnapshot?.provider ?? payload?.provider ?? null;
  const rows = buildGameStateRows(gsiState, labels, payload);
  const providerBlock =
    provider == null
      ? null
      : {
          heading: labels.providerHeading,
          rows: [
            {
              label: labels.providerGame,
              value: formatGsiProviderNameAppVersionLine(provider.name, provider.appid, provider.version),
            },
            {
              label: labels.providerGsiTime,
              value: formatGsiProviderClockHuman(provider.timestamp, providerTimeLocale),
            },
          ] satisfies KeyValueRow[],
        };
  return {
    title: labels.tabGameState,
    rows,
    providerBlock,
  };
}

/** Builds the full dashboard context value from props + tab state. */
export function buildGsiDashboardContextValue(input: GsiDashboardBuildInput): GsiDashboardContextValue {
  const payload = input.gsiState?.lastGameState ?? null;
  const waitingForCs2 = !payload && !input.cs2Running;
  const processingPanel: GsiDashboardPanelModel = {
    title: input.labels.tabProcessing,
    rows: buildProcessingRows(
      input.gsiState,
      input.labels,
      input.gatewayDiagnostics,
      input.formatTimestamp
    ),
  };
  const gameStatePanel = buildGameStatePanel(input.gsiState, input.labels, input.providerTimeLocale);
  return {
    labels: input.labels,
    gsiState: input.gsiState,
    gatewayDiagnostics: input.gatewayDiagnostics,
    gatewayWarning: input.gatewayWarning,
    waitingForCs2,
    activeTab: input.activeTab,
    setActiveTab: input.setActiveTab,
    hotkeyTabs: selectHotkeyTabs(input.labels),
    processingPanel,
    gameStatePanel,
  };
}

/** Read-only selectors for dashboard section components. */
export const gsiDashboardSelectors = {
  chrome: (v: GsiDashboardContextValue) => ({
    title: v.labels.title,
    gatewayWarning: v.gatewayWarning,
    warningPrefix: v.labels.warningPrefix,
    waitingForCs2: v.waitingForCs2,
    spinner: v.labels.spinner,
  }),

  hotkeyTabStrip: (v: GsiDashboardContextValue) => ({
    tabs: v.hotkeyTabs,
    activeIndex: v.activeTab,
    hint: v.labels.tabSwitchHint,
  }),
};

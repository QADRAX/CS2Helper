import type { HotkeyTabDescriptor } from "../components/atoms/hotkeyTabStrip";
import type { KeyValueRow } from "../components/atoms/gridRowList";
import type { Cs2ClientListenerDashboardLabels } from "../components/molecules/cs2ClientListenerDashboard.types";
import {
  CLIENT_LISTENER_DASHBOARD_ALL_FIELDS,
  type ClientListenerDashboardFieldDefinition,
  type ClientListenerDashboardLabelKey,
  type ClientListenerDashboardRegistryPanel,
  type ClientListenerDashboardRegistryTab,
} from "./clientListenerDashboardFieldRegistry";
import type {
  ClientListenerDashboardBuildInput,
  ClientListenerDashboardContextValue,
  ClientListenerDashboardGamePanelModel,
  ClientListenerDashboardPanelModel,
} from "./clientListenerDashboardTypes";
import {
  resolveDashboardFieldValue,
  type ClientListenerDashboardResolveContext,
} from "./clientListenerDashboardResolve";

export type { ClientListenerDashboardBuildInput } from "./clientListenerDashboardTypes";

function selectHotkeyTabs(labels: Cs2ClientListenerDashboardLabels): readonly HotkeyTabDescriptor[] {
  return [
    { hotkey: "7", label: labels.tabStream },
    { hotkey: "8", label: labels.tabGame },
    { hotkey: "9", label: labels.tabPerformance },
  ];
}

function matchesPlacement(
  field: ClientListenerDashboardFieldDefinition,
  tab: ClientListenerDashboardRegistryTab,
  panel: ClientListenerDashboardRegistryPanel
): boolean {
  return field.placement.tab === tab && field.placement.panel === panel;
}

function rowLabel(labels: Readonly<Cs2ClientListenerDashboardLabels>, key: ClientListenerDashboardLabelKey): string {
  return labels[key];
}

function buildRowsFromRegistry(
  tab: ClientListenerDashboardRegistryTab,
  panel: ClientListenerDashboardRegistryPanel,
  resolveCtx: ClientListenerDashboardResolveContext,
  labels: Cs2ClientListenerDashboardLabels
): KeyValueRow[] {
  return CLIENT_LISTENER_DASHBOARD_ALL_FIELDS.filter((f) => matchesPlacement(f, tab, panel)).map((field) => ({
    label: rowLabel(labels, field.labelKey),
    value: resolveDashboardFieldValue(field, resolveCtx),
  }));
}

function buildGamePanel(
  resolveCtx: ClientListenerDashboardResolveContext,
  labels: Cs2ClientListenerDashboardLabels
): ClientListenerDashboardGamePanelModel {
  const mainRows = buildRowsFromRegistry("game", "main", resolveCtx, labels);
  const provider = resolveCtx.provider;
  const providerBlock =
    provider == null
      ? null
      : {
          heading: labels.providerHeading,
          rows: buildRowsFromRegistry("game", "provider", resolveCtx, labels),
        };
  return {
    title: labels.tabGame,
    rows: mainRows,
    providerBlock,
  };
}

/** Builds the full dashboard context value from props + tab state. */
export function buildClientListenerDashboardContextValue(
  input: ClientListenerDashboardBuildInput
): ClientListenerDashboardContextValue {
  const payload = input.gsiState?.lastGameState ?? null;
  const waitingForCs2 = !payload && !input.cs2Running;
  const provider = input.gsiState?.lastSnapshot?.provider ?? payload?.provider ?? null;

  const resolveCtx: ClientListenerDashboardResolveContext = {
    gsiState: input.gsiState,
    gatewayDiagnostics: input.gatewayDiagnostics,
    performanceSnapshot: input.performanceSnapshot,
    labels: input.labels,
    formatTimestamp: input.formatTimestamp,
    providerTimeLocale: input.providerTimeLocale,
    payload,
    provider,
  };

  const streamPanel: ClientListenerDashboardPanelModel = {
    title: input.labels.tabStream,
    rows: buildRowsFromRegistry("stream", "main", resolveCtx, input.labels),
  };
  const gamePanel = buildGamePanel(resolveCtx, input.labels);
  const performancePanel: ClientListenerDashboardPanelModel = {
    title: input.labels.tabPerformance,
    rows: buildRowsFromRegistry("performance", "main", resolveCtx, input.labels),
  };

  return {
    labels: input.labels,
    gsiState: input.gsiState,
    gatewayDiagnostics: input.gatewayDiagnostics,
    performanceSnapshot: input.performanceSnapshot,
    gatewayWarning: input.gatewayWarning,
    waitingForCs2,
    activeTab: input.activeTab,
    setActiveTab: input.setActiveTab,
    hotkeyTabs: selectHotkeyTabs(input.labels),
    streamPanel,
    gamePanel,
    performancePanel,
  };
}

/** Read-only selectors for dashboard section components. */
export const clientListenerDashboardSelectors = {
  chrome: (v: ClientListenerDashboardContextValue) => ({
    title: v.labels.title,
    gatewayWarning: v.gatewayWarning,
    warningPrefix: v.labels.warningPrefix,
    waitingForCs2: v.waitingForCs2,
    spinner: v.labels.spinner,
  }),

  hotkeyTabStrip: (v: ClientListenerDashboardContextValue) => ({
    tabs: v.hotkeyTabs,
    activeIndex: v.activeTab,
    hint: v.labels.tabSwitchHint,
  }),
};

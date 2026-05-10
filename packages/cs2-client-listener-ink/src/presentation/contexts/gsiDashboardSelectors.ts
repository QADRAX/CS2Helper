import type { HotkeyTabDescriptor } from "../components/atoms/hotkeyTabStrip";
import type { KeyValueRow } from "../components/atoms/gridRowList";
import type { Cs2ClientListenerDashboardLabels } from "../components/molecules/cs2ClientListenerDashboard.types";
import {
  GSI_DASHBOARD_ALL_FIELDS,
  type GsiDashboardFieldDefinition,
  type GsiDashboardLabelKey,
  type GsiDashboardRegistryPanel,
  type GsiDashboardRegistryTab,
} from "./gsiDashboardFieldRegistry";
import type {
  GsiDashboardBuildInput,
  GsiDashboardContextValue,
  GsiDashboardGameStatePanelModel,
  GsiDashboardPanelModel,
} from "./gsiDashboardTypes";
import { resolveDashboardFieldValue, type GsiDashboardResolveContext } from "./gsiDashboardResolve";

export type { GsiDashboardBuildInput } from "./gsiDashboardTypes";

function selectHotkeyTabs(labels: Cs2ClientListenerDashboardLabels): readonly HotkeyTabDescriptor[] {
  return [
    { hotkey: "7", label: labels.tabProcessing },
    { hotkey: "8", label: labels.tabGameState },
  ];
}

function matchesPlacement(
  field: GsiDashboardFieldDefinition,
  tab: GsiDashboardRegistryTab,
  panel: GsiDashboardRegistryPanel
): boolean {
  return field.placement.tab === tab && field.placement.panel === panel;
}

function rowLabel(labels: Readonly<Cs2ClientListenerDashboardLabels>, key: GsiDashboardLabelKey): string {
  return labels[key];
}

function buildRowsFromRegistry(
  tab: GsiDashboardRegistryTab,
  panel: GsiDashboardRegistryPanel,
  resolveCtx: GsiDashboardResolveContext,
  labels: Cs2ClientListenerDashboardLabels
): KeyValueRow[] {
  return GSI_DASHBOARD_ALL_FIELDS.filter((f) => matchesPlacement(f, tab, panel)).map((field) => ({
    label: rowLabel(labels, field.labelKey),
    value: resolveDashboardFieldValue(field, resolveCtx),
  }));
}

function buildGameStatePanel(
  resolveCtx: GsiDashboardResolveContext,
  labels: Cs2ClientListenerDashboardLabels
): GsiDashboardGameStatePanelModel {
  const mainRows = buildRowsFromRegistry("gameState", "main", resolveCtx, labels);
  const provider = resolveCtx.provider;
  const providerBlock =
    provider == null
      ? null
      : {
          heading: labels.providerHeading,
          rows: buildRowsFromRegistry("gameState", "provider", resolveCtx, labels),
        };
  return {
    title: labels.tabGameState,
    rows: mainRows,
    providerBlock,
  };
}

/** Builds the full dashboard context value from props + tab state. */
export function buildGsiDashboardContextValue(input: GsiDashboardBuildInput): GsiDashboardContextValue {
  const payload = input.gsiState?.lastGameState ?? null;
  const waitingForCs2 = !payload && !input.cs2Running;
  const provider = input.gsiState?.lastSnapshot?.provider ?? payload?.provider ?? null;

  const resolveCtx: GsiDashboardResolveContext = {
    gsiState: input.gsiState,
    gatewayDiagnostics: input.gatewayDiagnostics,
    labels: input.labels,
    formatTimestamp: input.formatTimestamp,
    providerTimeLocale: input.providerTimeLocale,
    payload,
    provider,
  };

  const processingPanel: GsiDashboardPanelModel = {
    title: input.labels.tabProcessing,
    rows: buildRowsFromRegistry("processing", "main", resolveCtx, input.labels),
  };
  const gameStatePanel = buildGameStatePanel(resolveCtx, input.labels);

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

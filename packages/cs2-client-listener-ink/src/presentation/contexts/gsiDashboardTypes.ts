import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { HotkeyTabDescriptor } from "../components/atoms/hotkeyTabStrip";
import type { KeyValueRow } from "../components/atoms/gridRowList";
import type {
  Cs2ClientListenerDashboardLabels,
  GsiGatewayDiagnosticsView,
} from "../components/molecules/cs2ClientListenerDashboard.types";

export type GsiDashboardTabIndex = 0 | 1;

/** Inputs required to build dashboard view-model rows (shared by registry resolve + context builder). */
export interface GsiDashboardBuildInput {
  gsiState: Readonly<GsiProcessorState> | null;
  gatewayDiagnostics: GsiGatewayDiagnosticsView;
  cs2Running: boolean;
  labels: Cs2ClientListenerDashboardLabels;
  gatewayWarning?: string;
  formatTimestamp: (timestamp: number) => string;
  providerTimeLocale?: Intl.LocalesArgument;
  activeTab: GsiDashboardTabIndex;
  setActiveTab: (tab: GsiDashboardTabIndex) => void;
}

export interface GsiDashboardPanelModel {
  title: string;
  rows: KeyValueRow[];
}

export interface GsiDashboardGameStatePanelModel extends GsiDashboardPanelModel {
  providerBlock: null | { heading: string; rows: KeyValueRow[] };
}

/** Immutable view model for the GSI processor Ink dashboard. */
export interface GsiDashboardContextValue {
  labels: Cs2ClientListenerDashboardLabels;
  gsiState: Readonly<GsiProcessorState> | null;
  gatewayDiagnostics: GsiGatewayDiagnosticsView;
  gatewayWarning?: string;
  waitingForCs2: boolean;
  activeTab: GsiDashboardTabIndex;
  setActiveTab: (tab: GsiDashboardTabIndex) => void;
  hotkeyTabs: readonly HotkeyTabDescriptor[];
  processingPanel: GsiDashboardPanelModel;
  gameStatePanel: GsiDashboardGameStatePanelModel;
}

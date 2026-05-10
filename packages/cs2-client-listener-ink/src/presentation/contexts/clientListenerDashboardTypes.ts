import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { Cs2ProcessTrackingSnapshot } from "@cs2helper/performance-processor";
import type { HotkeyTabDescriptor } from "../components/atoms/hotkeyTabStrip";
import type { KeyValueRow } from "../components/atoms/gridRowList";
import type {
  Cs2ClientListenerDashboardLabels,
  ClientListenerGatewayCounters,
} from "../components/molecules/cs2ClientListenerDashboard.types";

export type ClientListenerDashboardTabIndex = 0 | 1 | 2;

/** Inputs required to build dashboard view-model rows. */
export interface ClientListenerDashboardBuildInput {
  gsiState: Readonly<GsiProcessorState> | null;
  gatewayDiagnostics: ClientListenerGatewayCounters;
  /** Latest `sources.performance` from the tick hub (null when missing or error payload). */
  performanceSnapshot: Readonly<Cs2ProcessTrackingSnapshot> | null;
  cs2Running: boolean;
  labels: Cs2ClientListenerDashboardLabels;
  gatewayWarning?: string;
  formatTimestamp: (timestamp: number) => string;
  providerTimeLocale?: Intl.LocalesArgument;
  activeTab: ClientListenerDashboardTabIndex;
  setActiveTab: (tab: ClientListenerDashboardTabIndex) => void;
}

export interface ClientListenerDashboardPanelModel {
  title: string;
  rows: KeyValueRow[];
}

export interface ClientListenerDashboardGamePanelModel extends ClientListenerDashboardPanelModel {
  providerBlock: null | { heading: string; rows: KeyValueRow[] };
}

/** Immutable view model for the CS2 client listener Ink dashboard. */
export interface ClientListenerDashboardContextValue {
  labels: Cs2ClientListenerDashboardLabels;
  gsiState: Readonly<GsiProcessorState> | null;
  gatewayDiagnostics: ClientListenerGatewayCounters;
  performanceSnapshot: Readonly<Cs2ProcessTrackingSnapshot> | null;
  gatewayWarning?: string;
  waitingForCs2: boolean;
  activeTab: ClientListenerDashboardTabIndex;
  setActiveTab: (tab: ClientListenerDashboardTabIndex) => void;
  hotkeyTabs: readonly HotkeyTabDescriptor[];
  streamPanel: ClientListenerDashboardPanelModel;
  gamePanel: ClientListenerDashboardGamePanelModel;
  performancePanel: ClientListenerDashboardPanelModel;
}

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useInput } from "ink";
import type { Cs2ProcessTrackingSnapshot } from "@cs2helper/performance-processor";
import { buildClientListenerDashboardContextValue, clientListenerDashboardSelectors } from "./clientListenerDashboardSelectors";
import type { ClientListenerDashboardContextValue, ClientListenerDashboardTabIndex } from "./clientListenerDashboardTypes";
import type {
  ClientListenerGatewayCounters,
  Cs2ClientListenerDashboardLabels,
} from "../components/molecules/cs2ClientListenerDashboard.types";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import { defaultFormatProcessorTimestamp } from "../utils/gsiStatusDashboardFormat";

const ClientListenerDashboardContext = createContext<ClientListenerDashboardContextValue | null>(null);

export interface ClientListenerDashboardProviderProps {
  children: ReactNode;
  gsiState: Readonly<GsiProcessorState> | null;
  gatewayDiagnostics: ClientListenerGatewayCounters;
  /** Latest tick `sources.performance` slice; omit or `null` when unavailable. */
  performanceSnapshot?: Readonly<Cs2ProcessTrackingSnapshot> | null;
  cs2Running: boolean;
  labels: Cs2ClientListenerDashboardLabels;
  gatewayWarning?: string;
  formatTimestamp?: (timestamp: number) => string;
  providerTimeLocale?: Intl.LocalesArgument;
}

/** Memoised dashboard view-model + tab navigation for the CS2 client listener Ink UI. */
export function ClientListenerDashboardProvider({
  children,
  gsiState,
  gatewayDiagnostics,
  performanceSnapshot = null,
  cs2Running,
  labels,
  gatewayWarning,
  formatTimestamp = defaultFormatProcessorTimestamp,
  providerTimeLocale,
}: ClientListenerDashboardProviderProps) {
  const [activeTab, setActiveTabState] = useState<ClientListenerDashboardTabIndex>(0);
  const setActiveTab = useCallback((tab: ClientListenerDashboardTabIndex) => {
    setActiveTabState(tab);
  }, []);

  useInput((input) => {
    if (input === "7") setActiveTab(0);
    if (input === "8") setActiveTab(1);
    if (input === "9") setActiveTab(2);
  });

  const value = useMemo(
    () =>
      buildClientListenerDashboardContextValue({
        gsiState,
        gatewayDiagnostics,
        performanceSnapshot,
        cs2Running,
        labels,
        gatewayWarning,
        formatTimestamp,
        providerTimeLocale,
        activeTab,
        setActiveTab,
      }),
    [
      activeTab,
      cs2Running,
      formatTimestamp,
      gatewayDiagnostics,
      gatewayWarning,
      gsiState,
      labels,
      performanceSnapshot,
      providerTimeLocale,
      setActiveTab,
    ]
  );

  return <ClientListenerDashboardContext.Provider value={value}>{children}</ClientListenerDashboardContext.Provider>;
}

export function useClientListenerDashboard(): ClientListenerDashboardContextValue {
  const ctx = useContext(ClientListenerDashboardContext);
  if (ctx == null) {
    throw new Error("useClientListenerDashboard must be used within ClientListenerDashboardProvider");
  }
  return ctx;
}

export type { ClientListenerDashboardContextValue, ClientListenerDashboardTabIndex } from "./clientListenerDashboardTypes";
export { clientListenerDashboardSelectors };

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useInput } from "ink";
import { buildGsiDashboardContextValue } from "./gsiDashboardSelectors";
import type { GsiDashboardContextValue, GsiDashboardTabIndex } from "./gsiDashboardTypes";
import type { Cs2ClientListenerDashboardLabels } from "../components/molecules/cs2ClientListenerDashboard.types";
import { defaultFormatProcessorTimestamp } from "../utils/gsiStatusDashboardFormat";

const GsiDashboardContext = createContext<GsiDashboardContextValue | null>(null);

export interface GsiDashboardProviderProps {
  children: ReactNode;
  gsiState: GsiDashboardContextValue["gsiState"];
  gatewayDiagnostics: GsiDashboardContextValue["gatewayDiagnostics"];
  cs2Running: boolean;
  labels: Cs2ClientListenerDashboardLabels;
  gatewayWarning?: string;
  formatTimestamp?: (timestamp: number) => string;
  providerTimeLocale?: Intl.LocalesArgument;
}

/** Holds memoised dashboard view-model + tab navigation for GSI processor Ink UI. */
export function GsiDashboardProvider({
  children,
  gsiState,
  gatewayDiagnostics,
  cs2Running,
  labels,
  gatewayWarning,
  formatTimestamp = defaultFormatProcessorTimestamp,
  providerTimeLocale,
}: GsiDashboardProviderProps) {
  const [activeTab, setActiveTabState] = useState<GsiDashboardTabIndex>(0);
  const setActiveTab = useCallback((tab: GsiDashboardTabIndex) => {
    setActiveTabState(tab);
  }, []);

  useInput((input) => {
    if (input === "7") setActiveTab(0);
    if (input === "8") setActiveTab(1);
  });

  const value = useMemo(
    () =>
      buildGsiDashboardContextValue({
        gsiState,
        gatewayDiagnostics,
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
      providerTimeLocale,
      setActiveTab,
    ]
  );

  return <GsiDashboardContext.Provider value={value}>{children}</GsiDashboardContext.Provider>;
}

export function useGsiDashboard(): GsiDashboardContextValue {
  const ctx = useContext(GsiDashboardContext);
  if (ctx == null) {
    throw new Error("useGsiDashboard must be used within GsiDashboardProvider");
  }
  return ctx;
}

export type { GsiDashboardContextValue, GsiDashboardTabIndex } from "./gsiDashboardTypes";
export { gsiDashboardSelectors } from "./gsiDashboardSelectors";

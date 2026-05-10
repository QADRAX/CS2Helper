import { Box } from "ink";
import { useMemo } from "react";
import { isCs2TickMasterData } from "@cs2helper/cs2-client-listener";
import { ClientListenerDashboardProvider } from "../../contexts/clientListenerDashboardContext";
import {
  ClientListenerDashboardChromeSection,
  ClientListenerDashboardGameSection,
  ClientListenerDashboardPerformanceSection,
  ClientListenerDashboardStreamSection,
  ClientListenerDashboardTabsSection,
} from "./clientListenerDashboardSections";
import type { Cs2ClientListenerDashboardProps } from "./cs2ClientListenerDashboard.types";
import { defaultFormatProcessorTimestamp } from "../../utils/gsiStatusDashboardFormat";
import { parseTickPerformanceSnapshot } from "../../utils/parseTickPerformanceSnapshot";

/** CS2 client listener Ink dashboard: stream, game, and performance tabs from a {@link TickFrame} hub. */
export function Cs2ClientListenerDashboard(props: Cs2ClientListenerDashboardProps) {
  const {
    tickFrame,
    gatewayDiagnostics,
    cs2Running,
    labels,
    gatewayWarning,
    formatTimestamp = defaultFormatProcessorTimestamp,
    providerTimeLocale,
  } = props;

  const gsiState = useMemo(() => {
    if (!tickFrame) {
      return null;
    }
    return isCs2TickMasterData(tickFrame.master) ? tickFrame.master.state : null;
  }, [tickFrame]);

  const performanceSnapshot = useMemo(() => parseTickPerformanceSnapshot(tickFrame), [tickFrame]);

  return (
    <ClientListenerDashboardProvider
      gsiState={gsiState}
      gatewayDiagnostics={gatewayDiagnostics}
      performanceSnapshot={performanceSnapshot}
      cs2Running={cs2Running}
      labels={labels}
      gatewayWarning={gatewayWarning}
      formatTimestamp={formatTimestamp}
      providerTimeLocale={providerTimeLocale}
    >
      <Box flexDirection="column" width="100%">
        <ClientListenerDashboardChromeSection />
        <ClientListenerDashboardTabsSection />
        <ClientListenerDashboardStreamSection />
        <ClientListenerDashboardGameSection />
        <ClientListenerDashboardPerformanceSection />
      </Box>
    </ClientListenerDashboardProvider>
  );
}

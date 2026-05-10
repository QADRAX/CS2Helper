import { Box } from "ink";
import { useMemo } from "react";
import { isCs2TickMasterData } from "@cs2helper/cs2-client-listener";
import { GsiDashboardProvider } from "../../contexts/gsiDashboardContext";
import {
  GsiDashboardChromeSection,
  GsiDashboardGameStateSection,
  GsiDashboardProcessingSection,
  GsiDashboardTabsSection,
} from "./gsiDashboardSections";
import type { Cs2ClientListenerDashboardProps } from "./cs2ClientListenerDashboard.types";
import { defaultFormatProcessorTimestamp } from "../../utils/gsiStatusDashboardFormat";

/** Displays GSI processor stream, gateway counters, and payload summary from a {@link TickFrame} stream. */
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

  return (
    <GsiDashboardProvider
      gsiState={gsiState}
      gatewayDiagnostics={gatewayDiagnostics}
      cs2Running={cs2Running}
      labels={labels}
      gatewayWarning={gatewayWarning}
      formatTimestamp={formatTimestamp}
      providerTimeLocale={providerTimeLocale}
    >
      <Box flexDirection="column" width="100%">
        <GsiDashboardChromeSection />
        <GsiDashboardTabsSection />
        <GsiDashboardProcessingSection />
        <GsiDashboardGameStateSection />
      </Box>
    </GsiDashboardProvider>
  );
}

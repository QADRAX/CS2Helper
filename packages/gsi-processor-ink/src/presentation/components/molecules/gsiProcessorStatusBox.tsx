import { Box } from "ink";
import { GsiDashboardProvider } from "../../contexts/gsiDashboardContext";
import {
  GsiDashboardChromeSection,
  GsiDashboardGameStateSection,
  GsiDashboardProcessingSection,
  GsiDashboardTabsSection,
} from "./gsiDashboardSections";
import type { GsiProcessorStatusBoxProps } from "./gsiProcessorStatusBox.types";
import { defaultFormatProcessorTimestamp } from "../../utils/gsiStatusDashboardFormat";

/** Displays the current GSI processor stream, gateway, and payload summary. */
export function GsiProcessorStatusBox(props: GsiProcessorStatusBoxProps) {
  const {
    gsiState,
    gatewayDiagnostics,
    cs2Running,
    labels,
    gatewayWarning,
    formatTimestamp = defaultFormatProcessorTimestamp,
    providerTimeLocale,
  } = props;

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

import { Box, Text } from "ink";
import type { SteamStatus } from "../../../application/useCases/getSteamStatus";
import type { CliStatus } from "../../../domain/cli";
import type { Cs2ProcessTrackingSnapshot } from "../../../domain/telemetry/cs2Process";
import type { SteamWebApiUiSlice } from "../../store/slices/ui/types";
import { msgKeys } from "../../i18n/msgKeys";
import { useTranslation } from "../../i18n/useTranslation";
import { HeaderStatusLine } from "../atoms/HeaderStatusLine";

interface CliHeaderPanelProps {
  steamStatus: SteamStatus;
  cs2Tracking: Cs2ProcessTrackingSnapshot;
  gatewayStatus: CliStatus;
  steamWebApi: SteamWebApiUiSlice;
}

export function CliHeaderPanel({
  steamStatus,
  cs2Tracking,
  gatewayStatus,
  steamWebApi,
}: CliHeaderPanelProps) {
  const { t } = useTranslation();
  return (
    <Box flexDirection="column" width="100%">
      <Text bold color="cyan">
        {t(msgKeys.cli.header.title)}
      </Text>
      <HeaderStatusLine
        steamRunning={steamStatus.running}
        cs2Tracking={cs2Tracking}
        gatewayStatus={gatewayStatus}
        steamWebApi={steamWebApi}
      />
    </Box>
  );
}

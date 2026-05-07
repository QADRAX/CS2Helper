import { Box, Text } from "ink";
import type { Cs2ProcessStatus } from "../../../application/cli/ports/Cs2ProcessPort";
import type { SteamStatus } from "../../../application/cli/useCases/getSteamStatus";
import type { CliStatus } from "../../../domain/cli";
import type { SteamWebApiUiSlice } from "../../store/slices/ui/types";
import { msgKeys } from "../../i18n/msgKeys";
import { useTranslation } from "../../i18n/useTranslation";
import { HeaderStatusLine } from "../atoms/HeaderStatusLine";

interface CliHeaderPanelProps {
  steamStatus: SteamStatus;
  cs2Status: Cs2ProcessStatus;
  gatewayStatus: CliStatus;
  steamWebApi: SteamWebApiUiSlice;
}

export function CliHeaderPanel({
  steamStatus,
  cs2Status,
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
        cs2Running={cs2Status.running}
        gatewayStatus={gatewayStatus}
        steamWebApi={steamWebApi}
      />
    </Box>
  );
}

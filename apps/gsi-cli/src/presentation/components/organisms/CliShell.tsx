import type { ReactNode } from "react";
import { Box } from "ink";
import type { Cs2ProcessStatus } from "../../../application/cli/ports/Cs2ProcessPort";
import type { SteamStatus } from "../../../application/cli/useCases/getSteamStatus";
import type { CliStatus } from "../../../domain/cli";
import type { NotificationItem } from "../../store";
import { CliHeaderPanel } from "../molecules/CliHeaderPanel";
import { NotificationsStack } from "../molecules/NotificationsStack";

interface CliShellProps {
  steamStatus: SteamStatus;
  cs2Status: Cs2ProcessStatus;
  gatewayStatus: CliStatus;
  gatewaySlot?: ReactNode;
  primarySlot: ReactNode;
  notifications: NotificationItem[];
}

export function CliShell({ steamStatus, cs2Status, gatewayStatus, gatewaySlot, primarySlot, notifications }: CliShellProps) {
  return (
    <Box flexDirection="column" width="100%">
      <CliHeaderPanel steamStatus={steamStatus} cs2Status={cs2Status} gatewayStatus={gatewayStatus} />
      {gatewaySlot}
      {primarySlot}
      <NotificationsStack notifications={notifications} />
    </Box>
  );
}

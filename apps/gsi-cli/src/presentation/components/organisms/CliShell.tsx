import type { ReactNode } from "react";
import { Box } from "ink";
import type { Cs2ProcessStatus } from "../../../application/cli/ports";
import type { SteamStatus } from "../../../application/cli/useCases/getSteamStatus";
import type { CliStatus } from "../../../domain/cli";
import type { NotificationItem } from "../../store";
import type { SteamWebApiUiSlice } from "../../store/slices/ui/types";
import { CliSectionDivider } from "../atoms/CliSectionDivider";
import { CliHeaderPanel } from "../molecules/CliHeaderPanel";
import { NotificationsStack } from "../molecules/NotificationsStack";

interface CliShellProps {
  steamStatus: SteamStatus;
  cs2Status: Cs2ProcessStatus;
  gatewayStatus: CliStatus;
  steamWebApi: SteamWebApiUiSlice;
  gatewaySlot?: ReactNode;
  primarySlot: ReactNode;
  notifications: NotificationItem[];
}

export function CliShell({
  steamStatus,
  cs2Status,
  gatewayStatus,
  steamWebApi,
  gatewaySlot,
  primarySlot,
  notifications,
}: CliShellProps) {
  const hasNotifications = notifications.length > 0;

  return (
    <Box borderStyle="single" flexDirection="column" width="100%">
      <Box paddingX={1}>
        <CliHeaderPanel
          steamStatus={steamStatus}
          cs2Status={cs2Status}
          gatewayStatus={gatewayStatus}
          steamWebApi={steamWebApi}
        />
      </Box>
      <CliSectionDivider />
      {gatewaySlot ? (
        <>
          <Box paddingX={1}>{gatewaySlot}</Box>
          <CliSectionDivider />
        </>
      ) : null}
      {primarySlot}
      {hasNotifications ? (
        <>
          <CliSectionDivider />
          <Box paddingX={1}>
            <NotificationsStack notifications={notifications} />
          </Box>
        </>
      ) : null}
    </Box>
  );
}

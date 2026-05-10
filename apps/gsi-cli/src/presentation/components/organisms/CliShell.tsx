import type { ReactNode } from "react";
import { Box } from "ink";
import type { SteamStatus } from "../../../application/useCases/getSteamStatus";
import type { CliStatus } from "../../../domain/cli";
import type { Cs2ProcessTrackingSnapshot } from "../../../domain/telemetry/cs2Process";
import type { NotificationItem } from "../../store";
import type { SteamWebApiUiSlice } from "../../store/slices/ui/types";
import { CliSectionDivider } from "../atoms/CliSectionDivider";
import { CliHeaderPanel } from "../molecules/CliHeaderPanel";
import { NotificationsStack } from "../molecules/NotificationsStack";

interface CliShellProps {
  steamStatus: SteamStatus;
  cs2Tracking: Cs2ProcessTrackingSnapshot;
  gatewayStatus: CliStatus;
  steamWebApi: SteamWebApiUiSlice;
  gatewaySlot?: ReactNode;
  primarySlot: ReactNode;
  notifications: NotificationItem[];
}

export function CliShell({
  steamStatus,
  cs2Tracking,
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
          cs2Tracking={cs2Tracking}
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

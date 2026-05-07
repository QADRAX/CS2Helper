import { Box, Text } from "ink";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { GatewayDiagnostics } from "../../../application/cli/ports/GatewayPort";
import { WaitingSpinner } from "../atoms/WaitingSpinner";
import { msgKeys } from "../../i18n/msgKeys";
import { useTranslation } from "../../i18n/useTranslation";

interface GatewayContentBoxProps {
  gsiState: Readonly<GsiProcessorState> | null;
  gatewayDiagnostics: GatewayDiagnostics;
  cs2Running: boolean;
  gatewayWarning?: string;
}

export function GatewayContentBox({
  gsiState,
  gatewayDiagnostics,
  cs2Running,
  gatewayWarning,
}: GatewayContentBoxProps) {
  const { t } = useTranslation();
  const payload = gsiState?.lastGameState;
  const watcherMode = gsiState?.watcherMode ?? payload?.watcherMode ?? null;
  const streamState = gsiState?.streamState ?? "inactive";
  const totalTicks = gsiState?.totalTicks ?? 0;
  const lastProcessedAt = gsiState?.lastProcessedAt ?? null;
  const player = payload && "player" in payload ? payload.player : undefined;
  const allplayers = payload && "allplayers" in payload ? payload.allplayers : undefined;
  const hasPlayer = Boolean(player);
  const allplayersCount = allplayers ? Object.keys(allplayers).length : 0;
  const localPlayerName = player?.name ?? "-";
  const waitingForCs2 = !payload && !cs2Running;

  return (
    <Box marginTop={1} borderStyle="single" paddingX={1} flexDirection="column" width="100%">
      <Text bold color="cyan">
        {t(msgKeys.cli.gateway.title)}
      </Text>
      {gatewayWarning ? (
        <Text color="yellow">
          {t(msgKeys.cli.gateway.warningPrefix)} {gatewayWarning}
        </Text>
      ) : null}
      <WaitingSpinner
        active={waitingForCs2}
        format={(frame) => t(msgKeys.cli.gateway.spinner, { frame })}
      />
      <Text>
        {t(msgKeys.cli.gateway.streamState)} {streamState}
      </Text>
      <Text>
        {t(msgKeys.cli.gateway.ticksReceived)} {totalTicks}
      </Text>
      <Text>
        {t(msgKeys.cli.gateway.lastTickAt)}{" "}
        {lastProcessedAt ? new Date(lastProcessedAt).toLocaleTimeString() : "-"}
      </Text>
      <Text>
        {t(msgKeys.cli.gateway.httpRequests)} {gatewayDiagnostics.receivedRequests}
      </Text>
      <Text>
        {t(msgKeys.cli.gateway.httpRejected)} {gatewayDiagnostics.rejectedRequests}
      </Text>
      <Text>
        {t(msgKeys.cli.gateway.lastRejectReason)} {gatewayDiagnostics.lastRejectReason ?? "-"}
      </Text>
      <Text>
        {t(msgKeys.cli.gateway.watcherMode)} {watcherMode ?? "-"}
      </Text>
      <Text>
        {t(msgKeys.cli.gateway.lastGameState)}{" "}
        {payload ? t(msgKeys.cli.gateway.valueAvailable) : t(msgKeys.cli.gateway.valueNull)}
      </Text>
      <Text>
        {t(msgKeys.cli.gateway.player)} {hasPlayer ? localPlayerName : t(msgKeys.cli.gateway.valueNone)}
      </Text>
      <Text>
        {t(msgKeys.cli.gateway.allplayers)} {allplayersCount}
      </Text>
    </Box>
  );
}

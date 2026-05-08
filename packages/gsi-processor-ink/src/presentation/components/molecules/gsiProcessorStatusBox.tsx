import { Box, Text } from "ink";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import { WaitingSpinner } from "../atoms";

/** Gateway counters displayed next to the processor state. */
export interface GsiGatewayDiagnosticsView {
  receivedRequests: number;
  rejectedRequests: number;
  lastRejectReason?: string;
}

/** Labels used by the terminal processor status component. */
export interface GsiProcessorStatusLabels {
  title: string;
  warningPrefix: string;
  spinner: (frame: string) => string;
  streamState: string;
  ticksReceived: string;
  lastTickAt: string;
  httpRequests: string;
  httpRejected: string;
  lastRejectReason: string;
  watcherMode: string;
  lastGameState: string;
  player: string;
  allplayers: string;
  valueAvailable: string;
  valueNull: string;
  valueNone: string;
}

/** Props for the shared Ink GSI processor status panel. */
export interface GsiProcessorStatusBoxProps {
  gsiState: Readonly<GsiProcessorState> | null;
  gatewayDiagnostics: GsiGatewayDiagnosticsView;
  cs2Running: boolean;
  labels: GsiProcessorStatusLabels;
  gatewayWarning?: string;
  formatTimestamp?: (timestamp: number) => string;
}

/** Displays the current GSI processor stream, gateway, and payload summary. */
export function GsiProcessorStatusBox({
  gsiState,
  gatewayDiagnostics,
  cs2Running,
  labels,
  gatewayWarning,
  formatTimestamp = defaultFormatTimestamp,
}: GsiProcessorStatusBoxProps) {
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
    <Box flexDirection="column" width="100%">
      <Text bold color="cyan">
        {labels.title}
      </Text>
      {gatewayWarning ? (
        <Text color="yellow">
          {labels.warningPrefix} {gatewayWarning}
        </Text>
      ) : null}
      <WaitingSpinner active={waitingForCs2} format={labels.spinner} />
      <Text>
        {labels.streamState} {streamState}
      </Text>
      <Text>
        {labels.ticksReceived} {totalTicks}
      </Text>
      <Text>
        {labels.lastTickAt} {lastProcessedAt ? formatTimestamp(lastProcessedAt) : "-"}
      </Text>
      <Text>
        {labels.httpRequests} {gatewayDiagnostics.receivedRequests}
      </Text>
      <Text>
        {labels.httpRejected} {gatewayDiagnostics.rejectedRequests}
      </Text>
      <Text>
        {labels.lastRejectReason} {gatewayDiagnostics.lastRejectReason ?? "-"}
      </Text>
      <Text>
        {labels.watcherMode} {watcherMode ?? "-"}
      </Text>
      <Text>
        {labels.lastGameState} {payload ? labels.valueAvailable : labels.valueNull}
      </Text>
      <Text>
        {labels.player} {hasPlayer ? localPlayerName : labels.valueNone}
      </Text>
      <Text>
        {labels.allplayers} {allplayersCount}
      </Text>
    </Box>
  );
}

function defaultFormatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

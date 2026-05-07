import { Box, Text } from "ink";
import { useEffect, useState } from "react";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { GatewayDiagnostics } from "../../../application/cli/ports/GatewayPort";

interface GatewayContentBoxProps {
  gsiState: Readonly<GsiProcessorState> | null;
  gatewayDiagnostics: GatewayDiagnostics;
  cs2Running: boolean;
  gatewayWarning?: string;
}

const SPINNER_FRAMES = ["|", "/", "-", "\\"];

export function GatewayContentBox({
  gsiState,
  gatewayDiagnostics,
  cs2Running,
  gatewayWarning,
}: GatewayContentBoxProps) {
  const [spinnerIndex, setSpinnerIndex] = useState(0);
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

  useEffect(() => {
    if (!waitingForCs2) return;
    const t = setInterval(() => {
      setSpinnerIndex((prev) => (prev + 1) % SPINNER_FRAMES.length);
    }, 120);
    return () => clearInterval(t);
  }, [waitingForCs2]);

  return (
    <Box marginTop={1} borderStyle="single" paddingX={1} flexDirection="column" width="100%">
      <Text bold color="cyan">
        Gateway Content
      </Text>
      {gatewayWarning ? <Text color="yellow">Warning: {gatewayWarning}</Text> : null}
      {waitingForCs2 ? (
        <Text color="yellow">
          {SPINNER_FRAMES[spinnerIndex]} waiting for cs2 client
        </Text>
      ) : null}
      <Text>streamState: {streamState}</Text>
      <Text>ticksReceived: {totalTicks}</Text>
      <Text>lastTickAt: {lastProcessedAt ? new Date(lastProcessedAt).toLocaleTimeString() : "-"}</Text>
      <Text>httpRequests: {gatewayDiagnostics.receivedRequests}</Text>
      <Text>httpRejected: {gatewayDiagnostics.rejectedRequests}</Text>
      <Text>lastRejectReason: {gatewayDiagnostics.lastRejectReason ?? "-"}</Text>
      <Text>watcherMode: {watcherMode ?? "-"}</Text>
      <Text>lastGameState: {payload ? "available" : "null"}</Text>
      <Text>player: {hasPlayer ? localPlayerName : "none"}</Text>
      <Text>allplayers: {allplayersCount}</Text>
    </Box>
  );
}

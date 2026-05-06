import { Box, Text } from "ink";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import { MutedText } from "../atoms/MutedText";
import { MatchHeadline } from "../molecules/MatchHeadline";
import { PlayerRow } from "../molecules/PlayerRow";
import { RoundSummary } from "../molecules/RoundSummary";
import { StreamMetricsFooter } from "../molecules/StreamMetricsFooter";

interface GsiDashboardPanelProps {
  gsiState: Readonly<GsiProcessorState> | null;
}

export function GsiDashboardPanel({ gsiState }: GsiDashboardPanelProps) {
  if (!gsiState) {
    return (
      <Box paddingY={1}>
        <MutedText italic>Waiting for GSI State...</MutedText>
      </Box>
    );
  }

  const { currentMatch, playersBySteamId } = gsiState;

  if (!currentMatch) {
    return (
      <Box flexDirection="column" gap={1}>
        <MutedText italic>Connected — waiting for match...</MutedText>
        <StreamMetricsFooter gsiState={gsiState} />
      </Box>
    );
  }

  const lastRound = currentMatch.rounds[currentMatch.rounds.length - 1];
  const players = Object.values(playersBySteamId);

  return (
    <Box flexDirection="column" gap={1}>
      <MatchHeadline match={currentMatch} />
      {lastRound ? <RoundSummary round={lastRound} /> : null}
      {players.length > 0 ? (
        <Box flexDirection="column">
          <Text bold color="cyan">
            Players
          </Text>
          {players.map((p) => (
            <PlayerRow key={p.steamid} player={p} />
          ))}
        </Box>
      ) : null}
      <StreamMetricsFooter gsiState={gsiState} />
    </Box>
  );
}

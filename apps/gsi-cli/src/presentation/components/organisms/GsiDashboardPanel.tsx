import { Box, Text } from "ink";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import { MutedText } from "../atoms/MutedText";
import { MatchHeadline } from "../molecules/MatchHeadline";
import { PlayerRow } from "../molecules/PlayerRow";
import { RoundSummary } from "../molecules/RoundSummary";
import { StreamMetricsFooter } from "../molecules/StreamMetricsFooter";

interface GsiDashboardPanelProps {
  gsiState: Readonly<GsiProcessorState> | null;
  /** Matches TTY width so long lines wrap instead of breaking the layout. */
  contentWidth: number;
}

export function GsiDashboardPanel({ gsiState, contentWidth }: GsiDashboardPanelProps) {
  if (!gsiState) {
    return (
      <Box paddingY={1} width={contentWidth}>
        <MutedText italic wrap="wrap">
          Waiting for GSI State...
        </MutedText>
      </Box>
    );
  }

  const { currentMatch, playersBySteamId } = gsiState;

  if (!currentMatch) {
    return (
      <Box flexDirection="column" gap={1} width={contentWidth}>
        <MutedText italic wrap="wrap">
          Connected — waiting for match...
        </MutedText>
        <StreamMetricsFooter gsiState={gsiState} contentWidth={contentWidth} />
      </Box>
    );
  }

  const lastRound = currentMatch.rounds[currentMatch.rounds.length - 1];
  const players = Object.values(playersBySteamId);

  return (
    <Box flexDirection="column" gap={1} width={contentWidth}>
      <MatchHeadline match={currentMatch} contentWidth={contentWidth} />
      {lastRound ? <RoundSummary round={lastRound} /> : null}
      {players.length > 0 ? (
        <Box flexDirection="column" width={contentWidth}>
          <Text bold color="cyan">
            Players
          </Text>
          {players.map((p) => (
            <PlayerRow key={p.steamid} player={p} contentWidth={contentWidth} />
          ))}
        </Box>
      ) : null}
      <StreamMetricsFooter gsiState={gsiState} contentWidth={contentWidth} />
    </Box>
  );
}

import { Box, Text } from "ink";
import type { RoundData } from "@cs2helper/gsi-processor";

interface RoundSummaryProps {
  round: RoundData;
}

export function RoundSummary({ round }: RoundSummaryProps) {
  const teamColor = round.playerTeam === "CT" ? "blue" : "red";

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color="cyan">
          Round {round.roundNumber}
        </Text>
        <Text color="gray"> • </Text>
        <Text color={teamColor} bold>
          {round.playerTeam}
        </Text>
        {round.winnerTeam ? (
          <>
            <Text color="gray"> • Winner: </Text>
            <Text color={round.winnerTeam === "CT" ? "blue" : "red"} bold>
              {round.winnerTeam}
            </Text>
          </>
        ) : null}
      </Box>

      <Box>
        <Text color="green">{round.kills.length}K</Text>
        <Text color="gray"> / </Text>
        <Text color="red">{round.deaths.length}D</Text>
        <Text color="gray"> | </Text>
        <Text color="yellow">{round.damageReceived.length} hits taken</Text>
        <Text color="gray"> | </Text>
        <Text color="magenta">{round.flashes.length} flashes</Text>
      </Box>

      {round.weaponTransactions.length > 0 ? (
        <Box>
          <Text color="gray">Buys: </Text>
          {round.weaponTransactions
            .filter((t) => t.transactionType === "purchase")
            .map((t, i) => (
              <Text key={i} color="white">
                {i > 0 ? ", " : ""}
                {t.weaponName} <Text color="yellow">${t.cost}</Text>
              </Text>
            ))}
        </Box>
      ) : null}
    </Box>
  );
}

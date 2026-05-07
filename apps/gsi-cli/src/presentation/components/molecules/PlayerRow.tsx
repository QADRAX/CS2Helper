import { Box, Text } from "ink";
import type { PlayerAggregate } from "@cs2helper/gsi-processor";

interface PlayerRowProps {
  player: PlayerAggregate;
  contentWidth: number;
}

export function PlayerRow({ player, contentWidth }: PlayerRowProps) {
  const teamColor = player.team === "CT" ? "blue" : "red";
  return (
    <Box flexDirection="row" flexWrap="wrap" width={contentWidth}>
      <Text color={teamColor} bold>
        {player.team}{" "}
      </Text>
      <Text color="white" wrap="wrap">
        {player.name}
      </Text>
      <Text color="gray"> • </Text>
      <Text color="green">{player.kills}K</Text>
      <Text color="gray">/</Text>
      <Text color="red">{player.deaths}D</Text>
      <Text color="gray"> • </Text>
      <Text color={player.health > 0 ? "green" : "red"}>❤️ {player.health}</Text>
      <Text color="gray"> • </Text>
      <Text color="yellow">💰 ${player.money}</Text>
    </Box>
  );
}

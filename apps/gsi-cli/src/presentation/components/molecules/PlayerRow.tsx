import { Box, Text } from "ink";
import type { PlayerAggregate } from "@cs2helper/gsi-processor";

interface PlayerRowProps {
  player: PlayerAggregate;
}

export function PlayerRow({ player }: PlayerRowProps) {
  const teamColor = player.team === "CT" ? "blue" : "red";
  return (
    <Box>
      <Text color={teamColor} bold>
        {player.team}{" "}
      </Text>
      <Text color="white">{player.name}</Text>
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

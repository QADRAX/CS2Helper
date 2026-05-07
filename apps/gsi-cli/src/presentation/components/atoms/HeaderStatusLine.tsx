import { Box, Text } from "ink";
import type { CliStatus } from "../../../domain/cli";
import { msgKeys } from "../../i18n/msgKeys";
import { useTranslation } from "../../i18n/useTranslation";
import { StatusIndicator } from "./StatusIndicator";

interface HeaderStatusLineProps {
  steamRunning: boolean;
  cs2Running: boolean;
  gatewayStatus: CliStatus;
}

export function HeaderStatusLine({ steamRunning, cs2Running, gatewayStatus }: HeaderStatusLineProps) {
  const { t } = useTranslation();
  const gatewayOnline = gatewayStatus === "LISTENING";
  const gatewayLabelText =
    gatewayStatus === "LISTENING"
      ? t(msgKeys.cli.status.gatewayListen)
      : gatewayStatus === "ERROR"
        ? t(msgKeys.cli.status.gatewayError)
        : t(msgKeys.cli.status.gatewayIdle);

  return (
    <Box gap={3} flexWrap="wrap">
      <Text>
        {t(msgKeys.cli.status.steam)}:{" "}
        <StatusIndicator
          value={steamRunning}
          onLabel={t(msgKeys.cli.status.on)}
          offLabel={t(msgKeys.cli.status.off)}
        />
      </Text>
      <Text>
        {t(msgKeys.cli.status.cs2)}:{" "}
        <StatusIndicator
          value={cs2Running}
          onLabel={t(msgKeys.cli.status.on)}
          offLabel={t(msgKeys.cli.status.off)}
        />
      </Text>
      <Text>
        {t(msgKeys.cli.status.gatewayLabel)}:{" "}
        <Text color={gatewayOnline ? "green" : "red"}>{gatewayLabelText}</Text>
      </Text>
    </Box>
  );
}

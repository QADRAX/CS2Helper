import { Box, Text } from "ink";
import type { CliStatus } from "../../../domain/cli";
import { msgKeys } from "../../i18n/msgKeys";
import type { SteamWebApiUiSlice } from "../../store/slices/ui/types";
import { useTranslation } from "../../i18n/useTranslation";
import { StatusIndicator } from "./StatusIndicator";

interface HeaderStatusLineProps {
  steamRunning: boolean;
  cs2Running: boolean;
  gatewayStatus: CliStatus;
  steamWebApi: SteamWebApiUiSlice;
}

function trimDetail(detail: string): string {
  const s = detail.replace(/\s+/g, " ").trim();
  return s.length > 28 ? `${s.slice(0, 25)}…` : s;
}

export function HeaderStatusLine({
  steamRunning,
  cs2Running,
  gatewayStatus,
  steamWebApi,
}: HeaderStatusLineProps) {
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
      {steamWebApi.enabled ? (
        <Text>
          {t(msgKeys.cli.status.steamWebApi)}:{" "}
          {steamWebApi.probe === "checking" ? (
            <Text color="yellow">{t(msgKeys.cli.status.steamWebApiPending)}</Text>
          ) : steamWebApi.probe === "ok" ? (
            <Text color="green">{t(msgKeys.cli.status.steamWebApiOk)}</Text>
          ) : (
            <>
              <Text color="red">{t(msgKeys.cli.status.steamWebApiFail)}</Text>
              {steamWebApi.detail ? (
                <Text dimColor> ({trimDetail(steamWebApi.detail)})</Text>
              ) : null}
            </>
          )}
        </Text>
      ) : null}
    </Box>
  );
}

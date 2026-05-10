import type { ReactNode } from "react";
import { Box, Text } from "ink";
import type { CliStatus } from "../../../domain/cli";
import type { Cs2ProcessTrackingSnapshot } from "../../../domain/telemetry/cs2Process";
import { msgKeys } from "../../i18n/msgKeys";
import type { SteamWebApiUiSlice } from "../../store/slices/ui/types";
import { useTranslation } from "../../i18n/useTranslation";
import { StatusIndicator } from "./StatusIndicator";

interface HeaderStatusLineProps {
  steamRunning: boolean;
  cs2Tracking: Cs2ProcessTrackingSnapshot;
  gatewayStatus: CliStatus;
  steamWebApi: SteamWebApiUiSlice;
}

function trimDetail(detail: string): string {
  const s = detail.replace(/\s+/g, " ").trim();
  return s.length > 28 ? `${s.slice(0, 25)}…` : s;
}

function formatFpsRounded(present: NonNullable<Cs2ProcessTrackingSnapshot["present"]>): number | undefined {
  if (present.fpsSmoothed !== undefined && Number.isFinite(present.fpsSmoothed)) {
    return Math.round(present.fpsSmoothed);
  }
  if (present.frametimeMs !== undefined && present.frametimeMs > 0) {
    return Math.round(1000 / present.frametimeMs);
  }
  return undefined;
}

export function HeaderStatusLine({
  steamRunning,
  cs2Tracking,
  gatewayStatus,
  steamWebApi,
}: HeaderStatusLineProps) {
  const { t } = useTranslation();
  const cs2Running = cs2Tracking.running;
  const cs2PresentChainError = cs2Tracking.presentChainError;
  const gatewayOnline = gatewayStatus === "LISTENING";
  const gatewayLabelText =
    gatewayStatus === "LISTENING"
      ? t(msgKeys.cli.status.gatewayListen)
      : gatewayStatus === "ERROR"
        ? t(msgKeys.cli.status.gatewayError)
        : t(msgKeys.cli.status.gatewayIdle);

  const na = t(msgKeys.cli.status.trackingNa);
  const telemetryNodes: ReactNode[] = [];
  if (cs2Running) {
    const { os, gpu, present } = cs2Tracking;
    const cpu = os?.cpuPercent;
    if (cpu !== undefined && Number.isFinite(cpu)) {
      telemetryNodes.push(
        <Text key="cpu">
          {t(msgKeys.cli.status.trackingCpu)} {Math.round(cpu)}%
        </Text>
      );
    }
    const ws = os?.workingSetBytes;
    if (ws !== undefined && Number.isFinite(ws)) {
      const mib = Math.round(ws / (1024 * 1024));
      telemetryNodes.push(
        <Text key="ram">
          {t(msgKeys.cli.status.trackingRam)} {mib} MiB
        </Text>
      );
    }
    if (gpu !== undefined) {
      const pct = gpu?.gpuUtilizationPercent;
      const dedic = gpu?.dedicatedMemoryBytes;
      const shared = gpu?.sharedMemoryBytes;
      let gpuText: string;
      if (pct !== undefined && Number.isFinite(pct)) {
        gpuText = `${Math.round(pct)}%`;
      } else if (dedic !== undefined && Number.isFinite(dedic)) {
        gpuText = `${Math.round(dedic / (1024 * 1024))} MiB`;
      } else if (shared !== undefined && Number.isFinite(shared)) {
        gpuText = `${Math.round(shared / (1024 * 1024))} MiB sh`;
      } else {
        gpuText = na;
      }
      telemetryNodes.push(
        <Text key="gpu">
          {t(msgKeys.cli.status.trackingGpu)} {gpuText}
        </Text>
      );
    }
    if (present) {
      const fps = formatFpsRounded(present);
      if (fps !== undefined) {
        telemetryNodes.push(
          <Text key="fps">
            {t(msgKeys.cli.status.trackingFps)} {fps}
          </Text>
        );
      }
    }
  }

  return (
    <Box flexDirection="column" width="100%">
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
        {cs2Running && cs2PresentChainError ? (
          <Text>
            {t(msgKeys.cli.presentMon.status.fpsTelemetryIssue)}:{" "}
            <Text color="yellow">{t(msgKeys.cli.presentMon.status.fpsTelemetryUnavailable)}</Text>
            <Text dimColor> ({trimDetail(cs2PresentChainError)})</Text>
          </Text>
        ) : null}
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
      {telemetryNodes.length > 0 ? (
        <Box marginTop={1} flexDirection="row" flexWrap="wrap" gap={1}>
          {telemetryNodes.map((node, i) => (
            <Box key={i} flexDirection="row" gap={1}>
              {i > 0 ? <Text dimColor>|</Text> : null}
              {node}
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

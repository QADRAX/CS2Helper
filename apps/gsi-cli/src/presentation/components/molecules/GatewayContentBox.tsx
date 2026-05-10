import {
  Cs2ClientListenerDashboard,
  type Cs2ClientListenerDashboardLabels,
} from "@cs2helper/cs2-client-listener-ink";
import type { TickFrame } from "@cs2helper/cs2-client-listener";
import type { GatewayDiagnostics } from "../../../application/ports/GatewayPort";
import { msgKeys } from "../../i18n/msgKeys";
import { useTranslation } from "../../i18n/useTranslation";

interface GatewayContentBoxProps {
  tickFrame: TickFrame | null;
  gatewayDiagnostics: GatewayDiagnostics;
  cs2Running: boolean;
  gatewayWarning?: string;
}

export function GatewayContentBox({
  tickFrame,
  gatewayDiagnostics,
  cs2Running,
  gatewayWarning,
}: GatewayContentBoxProps) {
  const { t, locale } = useTranslation();
  const labels: Cs2ClientListenerDashboardLabels = {
    title: t(msgKeys.cli.gateway.title),
    warningPrefix: t(msgKeys.cli.gateway.warningPrefix),
    spinner: (frame) => t(msgKeys.cli.gateway.spinner, { frame }),
    tabStream: t(msgKeys.cli.gateway.tabStream),
    tabGame: t(msgKeys.cli.gateway.tabGame),
    tabPerformance: t(msgKeys.cli.gateway.tabPerformance),
    tabSwitchHint: t(msgKeys.cli.gateway.tabSwitchHint),
    yes: t(msgKeys.cli.gateway.yes),
    no: t(msgKeys.cli.gateway.no),
    streamState: t(msgKeys.cli.gateway.streamState),
    ticksReceived: t(msgKeys.cli.gateway.ticksReceived),
    lastTickAt: t(msgKeys.cli.gateway.lastTickAt),
    httpRequests: t(msgKeys.cli.gateway.httpRequests),
    httpRejected: t(msgKeys.cli.gateway.httpRejected),
    lastRejectReason: t(msgKeys.cli.gateway.lastRejectReason),
    watcherMode: t(msgKeys.cli.gateway.watcherMode),
    lastGameState: t(msgKeys.cli.gateway.lastGameState),
    payloadKindClientLocal: t(msgKeys.cli.gateway.payloadKindClientLocal),
    payloadKindSpectatorHltv: t(msgKeys.cli.gateway.payloadKindSpectatorHltv),
    payloadKindDedicatedServer: t(msgKeys.cli.gateway.payloadKindDedicatedServer),
    valueAvailable: t(msgKeys.cli.gateway.valueAvailable),
    valueNull: t(msgKeys.cli.gateway.valueNull),
    valueNone: t(msgKeys.cli.gateway.valueNone),
    providerHeading: t(msgKeys.cli.gateway.providerHeading),
    providerGame: t(msgKeys.cli.gateway.providerGame),
    providerGsiTime: t(msgKeys.cli.gateway.providerGsiTime),
    matchSummary: t(msgKeys.cli.gateway.matchSummary),
    matchScore: t(msgKeys.cli.gateway.matchScore),
    playerHudControl: t(msgKeys.cli.gateway.playerHudControl),
    playerHudControlLocal: t(msgKeys.cli.gateway.playerHudControlLocal),
    playerHudControlSpectate: t(msgKeys.cli.gateway.playerHudControlSpectate),
    playerHudPov: t(msgKeys.cli.gateway.playerHudPov),
    perfProcessRunning: t(msgKeys.cli.gateway.perfProcessRunning),
    perfProcessPid: t(msgKeys.cli.gateway.perfProcessPid),
    perfCpuPercent: t(msgKeys.cli.gateway.perfCpuPercent),
    perfWorkingSetMb: t(msgKeys.cli.gateway.perfWorkingSetMb),
    perfGpuUtilization: t(msgKeys.cli.gateway.perfGpuUtilization),
    perfGpuDedicatedMb: t(msgKeys.cli.gateway.perfGpuDedicatedMb),
    perfGpuSharedMb: t(msgKeys.cli.gateway.perfGpuSharedMb),
    perfFpsSmoothed: t(msgKeys.cli.gateway.perfFpsSmoothed),
    perfFrametimeMs: t(msgKeys.cli.gateway.perfFrametimeMs),
    perfPresentChainError: t(msgKeys.cli.gateway.perfPresentChainError),
  };

  return (
    <Cs2ClientListenerDashboard
      tickFrame={tickFrame}
      gatewayDiagnostics={gatewayDiagnostics}
      cs2Running={cs2Running}
      gatewayWarning={gatewayWarning}
      labels={labels}
      providerTimeLocale={locale === "es" ? "es-ES" : "en-US"}
    />
  );
}

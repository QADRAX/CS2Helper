import { useState } from "react";
import { Box, Text, useInput } from "ink";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import { WaitingSpinner } from "../atoms";
import { formatGsiProviderClockHuman, formatGsiProviderNameAppVersionLine } from "../../utils/formatGsiProvider";

/** Gateway counters displayed next to the processor state. */
export interface GsiGatewayDiagnosticsView {
  receivedRequests: number;
  rejectedRequests: number;
  lastRejectReason?: string;
}

/** Labels used by the terminal processor status component. */
export interface GsiProcessorStatusLabels {
  title: string;
  warningPrefix: string;
  spinner: (frame: string) => string;
  tabProcessing: string;
  tabGameState: string;
  tabSwitchHint: string;
  streamState: string;
  ticksReceived: string;
  lastTickAt: string;
  httpRequests: string;
  httpRejected: string;
  lastRejectReason: string;
  watcherMode: string;
  lastGameState: string;
  payloadKindClientLocal: string;
  payloadKindSpectatorHltv: string;
  payloadKindDedicatedServer: string;
  valueAvailable: string;
  valueNull: string;
  valueNone: string;
  /** Row labels for the GSI `provider` block (game tab). */
  providerHeading: string;
  providerGame: string;
  providerGsiTime: string;
  /** Aggregated match / HUD context (game tab). */
  matchSummary: string;
  matchScore: string;
  playerHudControl: string;
  playerHudControlLocal: string;
  playerHudControlSpectate: string;
  playerHudPov: string;
}

/** Props for the shared Ink GSI processor status panel. */
export interface GsiProcessorStatusBoxProps {
  gsiState: Readonly<GsiProcessorState> | null;
  gatewayDiagnostics: GsiGatewayDiagnosticsView;
  cs2Running: boolean;
  labels: GsiProcessorStatusLabels;
  gatewayWarning?: string;
  formatTimestamp?: (timestamp: number) => string;
  /** Passed to `Intl` when formatting `provider.timestamp` (GSI clock). */
  providerTimeLocale?: Intl.LocalesArgument;
}

type DashboardTab = 0 | 1;

/** Displays the current GSI processor stream, gateway, and payload summary. */
export function GsiProcessorStatusBox({
  gsiState,
  gatewayDiagnostics,
  cs2Running,
  labels,
  gatewayWarning,
  formatTimestamp = defaultFormatTimestamp,
  providerTimeLocale,
}: GsiProcessorStatusBoxProps) {
  const [tab, setTab] = useState<DashboardTab>(0);

  useInput((input) => {
    if (input === "7") setTab(0);
    if (input === "8") setTab(1);
  });

  const payload = gsiState?.lastGameState ?? null;
  const watcherMode = gsiState?.watcherMode ?? payload?.watcherMode ?? null;
  const streamState = gsiState != null ? gsiState.streamState : "-";
  const totalTicks = gsiState?.totalTicks ?? 0;
  const lastProcessedAt = gsiState?.lastProcessedAt ?? null;
  const waitingForCs2 = !payload && !cs2Running;
  const provider = gsiState?.lastSnapshot?.provider ?? payload?.provider ?? null;

  return (
    <Box flexDirection="column" width="100%">
      <Text bold color="cyan">
        {labels.title}
      </Text>
      {gatewayWarning ? (
        <Text color="yellow">
          {labels.warningPrefix} {gatewayWarning}
        </Text>
      ) : null}
      <WaitingSpinner active={waitingForCs2} format={labels.spinner} />

      <Box marginTop={1} flexDirection="column">
        <Box flexDirection="row" gap={2}>
          <Text color={tab === 0 ? "cyan" : "gray"}>
            {tab === 0 ? "▸ " : "  "}[7] {labels.tabProcessing}
          </Text>
          <Text color={tab === 1 ? "cyan" : "gray"}>
            {tab === 1 ? "▸ " : "  "}[8] {labels.tabGameState}
          </Text>
        </Box>
        <Text dimColor>{labels.tabSwitchHint}</Text>
      </Box>

      {tab === 0 ? (
        <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1} paddingY={1} flexDirection="column">
          <Text bold color="gray">
            {labels.tabProcessing}
          </Text>
          <GridRow label={labels.streamState} value={String(streamState)} />
          <GridRow label={labels.ticksReceived} value={String(totalTicks)} />
          <GridRow
            label={labels.lastTickAt}
            value={lastProcessedAt ? formatTimestamp(lastProcessedAt) : "-"}
          />
          <GridRow label={labels.httpRequests} value={String(gatewayDiagnostics.receivedRequests)} />
          <GridRow label={labels.httpRejected} value={String(gatewayDiagnostics.rejectedRequests)} />
          <GridRow
            label={labels.lastRejectReason}
            value={gatewayDiagnostics.lastRejectReason ?? "-"}
          />
        </Box>
      ) : (
        <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1} paddingY={1} flexDirection="column">
          <Text bold color="gray">
            {labels.tabGameState}
          </Text>
          <GridRow
            label={labels.lastGameState}
            value={payload ? labels.valueAvailable : labels.valueNull}
          />
          <GridRow label={labels.watcherMode} value={watcherModeDisplayValue(labels, watcherMode)} />
          <GridRow label={labels.matchSummary} value={formatMatchSummaryLine(gsiState)} />
          <GridRow label={labels.matchScore} value={formatMatchScoreLine(gsiState)} />
          <GridRow
            label={labels.playerHudControl}
            value={
              gsiState?.isSpectatingOtherPlayer
                ? labels.playerHudControlSpectate
                : labels.playerHudControlLocal
            }
          />
          <GridRow label={labels.playerHudPov} value={formatHudPovLine(gsiState)} />
          {provider ? (
            <>
              <Box marginTop={1}>
                <Text dimColor>{labels.providerHeading}</Text>
              </Box>
              <GridRow
                label={labels.providerGame}
                value={formatGsiProviderNameAppVersionLine(provider.name, provider.appid, provider.version)}
              />
              <GridRow
                label={labels.providerGsiTime}
                value={formatGsiProviderClockHuman(provider.timestamp, providerTimeLocale)}
              />
            </>
          ) : null}
        </Box>
      )}
    </Box>
  );
}

function GridRow({ label, value }: { label: string; value: string }) {
  return (
    <Box flexDirection="row" justifyContent="space-between" width="100%">
      <Text dimColor>{label}</Text>
      <Text>{value}</Text>
    </Box>
  );
}

function watcherModeDisplayValue(
  labels: GsiProcessorStatusLabels,
  mode: string | null | undefined
): string {
  if (mode == null || mode === "") {
    return "-";
  }
  switch (mode) {
    case "client_local":
      return labels.payloadKindClientLocal;
    case "spectator_hltv":
      return labels.payloadKindSpectatorHltv;
    case "dedicated_server":
      return labels.payloadKindDedicatedServer;
    default:
      return mode;
  }
}

function defaultFormatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

function formatMatchSummaryLine(gsiState: Readonly<GsiProcessorState> | null): string {
  const map = gsiState?.lastSnapshot?.map;
  if (!map) return "-";
  return `${map.name} · ${map.mode} · ${map.phase} · R${map.round}`;
}

function formatMatchScoreLine(gsiState: Readonly<GsiProcessorState> | null): string {
  const map = gsiState?.lastSnapshot?.map;
  if (!map) return "-";
  return `CT ${map.team_ct.score} – ${map.team_t.score} T`;
}

function formatHudPovLine(gsiState: Readonly<GsiProcessorState> | null): string {
  const id = gsiState?.focusedPlayerSteamId;
  if (!id) return "-";
  const row = gsiState.playersBySteamId[id];
  if (!row) return id;
  return `${row.name} (${row.team})`;
}

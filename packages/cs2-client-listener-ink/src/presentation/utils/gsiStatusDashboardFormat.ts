import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { Cs2ClientListenerDashboardLabels } from "../components/molecules/cs2ClientListenerDashboard.types";

export function formatMatchSummaryLine(gsiState: Readonly<GsiProcessorState> | null): string {
  const map = gsiState?.lastSnapshot?.map;
  if (!map) return "-";
  return `${map.name} · ${map.mode} · ${map.phase} · R${map.round}`;
}

export function formatMatchScoreLine(gsiState: Readonly<GsiProcessorState> | null): string {
  const map = gsiState?.lastSnapshot?.map;
  if (!map) return "-";
  return `CT ${map.team_ct.score} – ${map.team_t.score} T`;
}

export function formatHudPovLine(gsiState: Readonly<GsiProcessorState> | null): string {
  const id = gsiState?.focusedPlayerSteamId;
  if (!id) return "-";
  const row = gsiState.playersBySteamId[id];
  if (!row) return id;
  return `${row.name} (${row.team})`;
}

export function watcherModeDisplayValue(
  labels: Cs2ClientListenerDashboardLabels,
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

export function defaultFormatProcessorTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

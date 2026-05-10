import type { GsiProcessorState, WatcherProvider } from "@cs2helper/gsi-processor";
import type { Cs2ProcessTrackingSnapshot } from "@cs2helper/performance-processor";
import type {
  Cs2ClientListenerDashboardLabels,
  ClientListenerGatewayCounters,
} from "../components/molecules/cs2ClientListenerDashboard.types";
import { formatGsiProviderClockHuman, formatGsiProviderNameAppVersionLine } from "../utils/formatGsiProvider";
import {
  formatHudPovLine,
  formatMatchScoreLine,
  formatMatchSummaryLine,
  watcherModeDisplayValue,
} from "../utils/gsiStatusDashboardFormat";
import type {
  ClientListenerDashboardComputedBindingId,
  ClientListenerDashboardDataBinding,
  ClientListenerDashboardFieldDefinition,
  ClientListenerDashboardGatewayKey,
  ClientListenerDashboardPerformanceKey,
  ClientListenerDashboardPresentKind,
  ClientListenerDashboardStateScalarKey,
} from "./clientListenerDashboardFieldRegistry";

export interface ClientListenerDashboardResolveContext {
  gsiState: Readonly<GsiProcessorState> | null;
  gatewayDiagnostics: ClientListenerGatewayCounters;
  performanceSnapshot: Readonly<Cs2ProcessTrackingSnapshot> | null;
  labels: Cs2ClientListenerDashboardLabels;
  formatTimestamp: (timestamp: number) => string;
  providerTimeLocale?: Intl.LocalesArgument;
  payload: unknown | null;
  provider: WatcherProvider | null;
}

function formatMb(bytes: number | undefined): string {
  if (bytes == null || !Number.isFinite(bytes)) return "-";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatOptionalNumber(n: number | undefined | null, suffix = ""): string {
  if (n == null || !Number.isFinite(n)) return "-";
  return `${n.toFixed(1)}${suffix}`;
}

function resolveStateScalar(
  key: ClientListenerDashboardStateScalarKey,
  gsiState: Readonly<GsiProcessorState> | null
): unknown {
  if (gsiState == null) {
    if (key === "streamState") return "-";
    if (key === "totalTicks") return 0;
    return null;
  }
  if (key === "streamState") return gsiState.streamState;
  if (key === "totalTicks") return gsiState.totalTicks;
  return gsiState.lastProcessedAt;
}

function resolveGatewayScalar(key: ClientListenerDashboardGatewayKey, gateway: ClientListenerGatewayCounters): unknown {
  if (key === "lastRejectReason") {
    return gateway.lastRejectReason ?? "-";
  }
  if (key === "receivedRequests") return gateway.receivedRequests;
  return gateway.rejectedRequests;
}

function resolvePerformanceScalar(
  key: ClientListenerDashboardPerformanceKey,
  snap: Readonly<Cs2ProcessTrackingSnapshot> | null
): unknown {
  if (snap == null) {
    return null;
  }
  switch (key) {
    case "processRunning":
      return snap.running;
    case "processPid":
      return snap.pid != null ? String(snap.pid) : "-";
    case "presentChainError":
      return snap.presentChainError ?? "-";
    case "cpuPercent":
      return snap.os?.cpuPercent != null && Number.isFinite(snap.os.cpuPercent)
        ? `${snap.os.cpuPercent.toFixed(1)}%`
        : "-";
    case "workingSetMb":
      return formatMb(snap.os?.workingSetBytes);
    case "gpuUtilizationPercent":
      return snap.gpu === null
        ? "-"
        : snap.gpu?.gpuUtilizationPercent != null && Number.isFinite(snap.gpu.gpuUtilizationPercent)
          ? `${snap.gpu.gpuUtilizationPercent.toFixed(1)}%`
          : "-";
    case "gpuDedicatedMb":
      return snap.gpu === null ? "-" : formatMb(snap.gpu?.dedicatedMemoryBytes);
    case "gpuSharedMb":
      return snap.gpu === null ? "-" : formatMb(snap.gpu?.sharedMemoryBytes);
    case "fpsSmoothed":
      return snap.present?.fpsSmoothed != null && Number.isFinite(snap.present.fpsSmoothed)
        ? formatOptionalNumber(snap.present.fpsSmoothed, " FPS")
        : "-";
    case "frametimeMs":
      return snap.present?.frametimeMs != null && Number.isFinite(snap.present.frametimeMs)
        ? `${snap.present.frametimeMs.toFixed(2)} ms`
        : "-";
    default: {
      const _e: never = key;
      return _e;
    }
  }
}

function resolveComputed(id: ClientListenerDashboardComputedBindingId, ctx: ClientListenerDashboardResolveContext): unknown {
  const { gsiState, labels, payload, provider } = ctx;
  switch (id) {
    case "lastGameStateAvailability":
      return payload ? labels.valueAvailable : labels.valueNull;
    case "watcherModeEffective":
      return (
        gsiState?.watcherMode ?? (payload as { watcherMode?: string } | null)?.watcherMode ?? null
      );
    case "matchSummaryLine":
      return formatMatchSummaryLine(gsiState);
    case "matchScoreLine":
      return formatMatchScoreLine(gsiState);
    case "hudControlLabel":
      return gsiState?.isSpectatingOtherPlayer
        ? labels.playerHudControlSpectate
        : labels.playerHudControlLocal;
    case "hudPovLine":
      return formatHudPovLine(gsiState);
    case "providerNameAppBuildLine":
    case "providerGsiClock":
      return provider;
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

function resolveBindingRaw(binding: ClientListenerDashboardDataBinding, ctx: ClientListenerDashboardResolveContext): unknown {
  if (binding.kind === "state") {
    return resolveStateScalar(binding.key, ctx.gsiState);
  }
  if (binding.kind === "gateway") {
    return resolveGatewayScalar(binding.key, ctx.gatewayDiagnostics);
  }
  if (binding.kind === "performance") {
    return resolvePerformanceScalar(binding.key, ctx.performanceSnapshot);
  }
  return resolveComputed(binding.id, ctx);
}

function applyPresent(
  present: ClientListenerDashboardPresentKind,
  raw: unknown,
  labels: Cs2ClientListenerDashboardLabels,
  formatTimestamp: (timestamp: number) => string,
  providerTimeLocale: Intl.LocalesArgument | undefined
): string {
  switch (present) {
    case "identity":
      if (raw == null) return "-";
      return String(raw);
    case "yesNo":
      if (raw == null) return "-";
      return raw === true ? labels.yes : labels.no;
    case "timestamp": {
      const ts = raw as number | null;
      return ts != null ? formatTimestamp(ts) : "-";
    }
    case "watcherMode":
      return watcherModeDisplayValue(labels, raw as string | null | undefined);
    case "matchSummary":
    case "matchScore":
    case "hudPov":
      return String(raw ?? "-");
    case "providerGameLine": {
      const p = raw as WatcherProvider | null;
      if (p == null) return "-";
      return formatGsiProviderNameAppVersionLine(p.name, p.appid, p.version);
    }
    case "gsiClock": {
      const p = raw as WatcherProvider | null;
      if (p == null) return "-";
      return formatGsiProviderClockHuman(p.timestamp, providerTimeLocale);
    }
    default: {
      const _exhaustive: never = present;
      return String(_exhaustive);
    }
  }
}

export function resolveDashboardFieldValue(
  field: ClientListenerDashboardFieldDefinition,
  ctx: ClientListenerDashboardResolveContext
): string {
  const raw = resolveBindingRaw(field.binding, ctx);
  return applyPresent(field.present, raw, ctx.labels, ctx.formatTimestamp, ctx.providerTimeLocale);
}

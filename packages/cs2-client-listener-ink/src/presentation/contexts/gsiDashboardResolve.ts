import type { GsiProcessorState, WatcherProvider } from "@cs2helper/gsi-processor";
import type {
  Cs2ClientListenerDashboardLabels,
  GsiGatewayDiagnosticsView,
} from "../components/molecules/cs2ClientListenerDashboard.types";
import { formatGsiProviderClockHuman, formatGsiProviderNameAppVersionLine } from "../utils/formatGsiProvider";
import {
  formatHudPovLine,
  formatMatchScoreLine,
  formatMatchSummaryLine,
  watcherModeDisplayValue,
} from "../utils/gsiStatusDashboardFormat";
import type {
  GsiDashboardComputedBindingId,
  GsiDashboardDataBinding,
  GsiDashboardFieldDefinition,
  GsiDashboardGatewayKey,
  GsiDashboardPresentKind,
  GsiDashboardStateScalarKey,
} from "./gsiDashboardFieldRegistry";

/** Pre-derived payload + provider for one tick (avoids recomputing per row). */
export interface GsiDashboardResolveContext {
  gsiState: Readonly<GsiProcessorState> | null;
  gatewayDiagnostics: GsiGatewayDiagnosticsView;
  labels: Cs2ClientListenerDashboardLabels;
  formatTimestamp: (timestamp: number) => string;
  providerTimeLocale?: Intl.LocalesArgument;
  payload: unknown | null;
  provider: WatcherProvider | null;
}

function resolveStateScalar(key: GsiDashboardStateScalarKey, gsiState: Readonly<GsiProcessorState> | null): unknown {
  if (gsiState == null) {
    if (key === "streamState") return "-";
    if (key === "totalTicks") return 0;
    return null;
  }
  if (key === "streamState") return gsiState.streamState;
  if (key === "totalTicks") return gsiState.totalTicks;
  return gsiState.lastProcessedAt;
}

function resolveGatewayScalar(key: GsiDashboardGatewayKey, gateway: GsiGatewayDiagnosticsView): unknown {
  if (key === "lastRejectReason") {
    return gateway.lastRejectReason ?? "-";
  }
  if (key === "receivedRequests") return gateway.receivedRequests;
  return gateway.rejectedRequests;
}

function resolveComputed(id: GsiDashboardComputedBindingId, ctx: GsiDashboardResolveContext): unknown {
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

function resolveBindingRaw(binding: GsiDashboardDataBinding, ctx: GsiDashboardResolveContext): unknown {
  if (binding.kind === "state") {
    return resolveStateScalar(binding.key, ctx.gsiState);
  }
  if (binding.kind === "gateway") {
    return resolveGatewayScalar(binding.key, ctx.gatewayDiagnostics);
  }
  return resolveComputed(binding.id, ctx);
}

function applyPresent(
  present: GsiDashboardPresentKind,
  raw: unknown,
  labels: Cs2ClientListenerDashboardLabels,
  formatTimestamp: (timestamp: number) => string,
  providerTimeLocale: Intl.LocalesArgument | undefined
): string {
  switch (present) {
    case "identity":
      if (raw == null) return "-";
      return String(raw);
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

/** Resolves one registry field to its right-column display string. */
export function resolveDashboardFieldValue(field: GsiDashboardFieldDefinition, ctx: GsiDashboardResolveContext): string {
  const raw = resolveBindingRaw(field.binding, ctx);
  return applyPresent(field.present, raw, ctx.labels, ctx.formatTimestamp, ctx.providerTimeLocale);
}

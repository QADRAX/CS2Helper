import { describe, expect, it } from "vitest";
import type { Cs2ClientListenerDashboardLabels } from "../../components/molecules/cs2ClientListenerDashboard.types";
import { CLIENT_LISTENER_DASHBOARD_ALL_FIELDS } from "../clientListenerDashboardFieldRegistry";

/** Minimal stub; `satisfies` ensures every `keyof Cs2ClientListenerDashboardLabels` is present. */
const labelStub = {
  title: "t",
  warningPrefix: "w",
  spinner: (frame: string) => frame,
  tabStream: "ts",
  tabGame: "tg",
  tabPerformance: "tp",
  tabSwitchHint: "h",
  streamState: "ss",
  ticksReceived: "tr",
  lastTickAt: "lta",
  httpRequests: "hr",
  httpRejected: "hj",
  lastRejectReason: "lr",
  watcherMode: "wm",
  lastGameState: "lgs",
  payloadKindClientLocal: "c",
  payloadKindSpectatorHltv: "s",
  payloadKindDedicatedServer: "d",
  valueAvailable: "va",
  valueNull: "vn",
  valueNone: "none",
  yes: "y",
  no: "n",
  providerHeading: "ph",
  providerGame: "pg",
  providerGsiTime: "pt",
  matchSummary: "ms",
  matchScore: "msc",
  playerHudControl: "phc",
  playerHudControlLocal: "phcl",
  playerHudControlSpectate: "phcs",
  playerHudPov: "php",
  perfProcessRunning: "pr",
  perfProcessPid: "pp",
  perfCpuPercent: "pc",
  perfWorkingSetMb: "pw",
  perfGpuUtilization: "pgu",
  perfGpuDedicatedMb: "pgd",
  perfGpuSharedMb: "pgs",
  perfFpsSmoothed: "pf",
  perfFrametimeMs: "pft",
  perfPresentChainError: "pe",
} satisfies Cs2ClientListenerDashboardLabels;

describe("clientListenerDashboardFieldRegistry", () => {
  it("each registry entry maps to a label slot on Cs2ClientListenerDashboardLabels", () => {
    const seen = new Set<string>();
    for (const field of CLIENT_LISTENER_DASHBOARD_ALL_FIELDS) {
      expect(seen.has(field.id)).toBe(false);
      seen.add(field.id);
      const slot = labelStub[field.labelKey];
      expect(slot).toBeDefined();
    }
  });

  it("keeps expected section sizes for regression detection", () => {
    const count = (tab: "stream" | "game" | "performance", panel: "main" | "provider") =>
      CLIENT_LISTENER_DASHBOARD_ALL_FIELDS.filter((f) => f.placement.tab === tab && f.placement.panel === panel).length;

    expect(count("stream", "main")).toBe(6);
    expect(count("game", "main")).toBe(6);
    expect(count("game", "provider")).toBe(2);
    expect(count("performance", "main")).toBe(10);
    expect(CLIENT_LISTENER_DASHBOARD_ALL_FIELDS).toHaveLength(24);
  });
});

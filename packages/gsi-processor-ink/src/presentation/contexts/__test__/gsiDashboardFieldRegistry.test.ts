import { describe, expect, it } from "vitest";
import type { GsiProcessorStatusLabels } from "../../components/molecules/gsiProcessorStatusBox.types";
import { GSI_DASHBOARD_ALL_FIELDS } from "../gsiDashboardFieldRegistry";

/** Minimal stub; `satisfies` ensures every `keyof GsiProcessorStatusLabels` is present. */
const labelStub = {
  title: "t",
  warningPrefix: "w",
  spinner: (frame: string) => frame,
  tabProcessing: "p",
  tabGameState: "g",
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
  providerHeading: "ph",
  providerGame: "pg",
  providerGsiTime: "pt",
  matchSummary: "ms",
  matchScore: "msc",
  playerHudControl: "phc",
  playerHudControlLocal: "phcl",
  playerHudControlSpectate: "phcs",
  playerHudPov: "php",
} satisfies GsiProcessorStatusLabels;

describe("gsiDashboardFieldRegistry", () => {
  it("each registry entry maps to a label slot on GsiProcessorStatusLabels", () => {
    const seen = new Set<string>();
    for (const field of GSI_DASHBOARD_ALL_FIELDS) {
      expect(seen.has(field.id)).toBe(false);
      seen.add(field.id);
      const slot = labelStub[field.labelKey];
      expect(slot).toBeDefined();
    }
  });

  it("keeps expected section sizes for regression detection", () => {
    const count = (tab: "processing" | "gameState", panel: "main" | "provider") =>
      GSI_DASHBOARD_ALL_FIELDS.filter((f) => f.placement.tab === tab && f.placement.panel === panel).length;

    expect(count("processing", "main")).toBe(6);
    expect(count("gameState", "main")).toBe(6);
    expect(count("gameState", "provider")).toBe(2);
    expect(GSI_DASHBOARD_ALL_FIELDS).toHaveLength(14);
  });
});

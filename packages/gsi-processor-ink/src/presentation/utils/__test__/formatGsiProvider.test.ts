import { describe, expect, it } from "vitest";
import {
  formatGsiProviderClockHuman,
  formatGsiProviderNameAppVersionLine,
  gsiProviderTimestampToMs,
} from "../formatGsiProvider";

describe("gsiProviderTimestampToMs", () => {
  it("treats 10-digit values as Unix seconds", () => {
    expect(gsiProviderTimestampToMs(1_778_178_751)).toBe(1_778_178_751_000);
  });

  it("passes through millisecond-scale values", () => {
    expect(gsiProviderTimestampToMs(1_778_178_751_000)).toBe(1_778_178_751_000);
  });
});

describe("formatGsiProviderNameAppVersionLine", () => {
  it("joins raw name, app id, and build", () => {
    expect(
      formatGsiProviderNameAppVersionLine("Counter-Strike: Global Offensive", 730, 14159)
    ).toBe("Counter-Strike: Global Offensive · app 730 · build 14159");
  });

  it("uses placeholder for empty name", () => {
    expect(formatGsiProviderNameAppVersionLine("  ", 730, 1)).toBe("— · app 730 · build 1");
  });
});

describe("formatGsiProviderClockHuman", () => {
  it("includes milliseconds in the time segment", () => {
    const s = formatGsiProviderClockHuman(1_778_178_751, "en-US");
    expect(s).toMatch(/2026/);
    expect(s).toMatch(/\.\d{3}/);
  });
});

import { describe, expect, it } from "vitest";
import { parseSteamcmdLine } from "../steamProgress";

describe("parseSteamcmdLine", () => {
  it("parses progress with bytes", () => {
    const r = parseSteamcmdLine(
      "Update state (0x61) downloading, progress: 50 (1000 / 2000)"
    );
    expect(r?.percent).toBe(50);
    expect(r?.bytesDownloaded).toBe(1000);
    expect(r?.bytesTotal).toBe(2000);
    expect(r?.stage).toBe("downloading");
  });
});

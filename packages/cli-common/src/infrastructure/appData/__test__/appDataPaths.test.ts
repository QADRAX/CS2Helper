import { describe, expect, it, vi } from "vitest";
import {
  buildGsiCliRecordingFilePath,
  getCliAppDataDir,
  getGsiCliRecordingsDir,
} from "../appDataPaths";

describe("appDataPaths", () => {
  it("builds the shared gsi-cli recordings path from APPDATA", () => {
    vi.stubEnv("APPDATA", "C:\\Users\\Tester\\AppData\\Roaming");

    expect(getCliAppDataDir("gsi-cli")).toContain("CS2Helper");
    expect(getGsiCliRecordingsDir()).toContain("recordings");
    expect(buildGsiCliRecordingFilePath(new Date("2026-01-02T03:04:05.006Z"))).toContain(
      "gsi-2026-01-02T03-04-05-006Z.ndjson"
    );

    vi.unstubAllEnvs();
  });
});

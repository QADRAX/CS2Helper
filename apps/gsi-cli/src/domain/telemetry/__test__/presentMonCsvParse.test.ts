import { describe, expect, it } from "vitest";
import {
  parsePresentMonHeader,
  presentMonDataLineToSample,
  splitPresentMonCsvLine,
} from "../presentMonCsvParse";

describe("presentMonCsvParse", () => {
  it("splitPresentMonCsvLine handles quoted commas", () => {
    expect(splitPresentMonCsvLine(`"a,b",c`)).toEqual(["a,b", "c"]);
  });

  it("parsePresentMonHeader finds columns", () => {
    const header =
      "Application,ProcessID,MsBetweenPresents,CPUStartQPCTime,MsInPresentAPI";
    const layout = parsePresentMonHeader(header);
    expect(layout).not.toBeNull();
    expect(layout!.names).toContain("MsBetweenPresents");
    expect(layout!.msBetweenPresents).toBeGreaterThanOrEqual(0);
    expect(layout!.cpuStartQpcMs).toBeGreaterThanOrEqual(0);
  });

  it("presentMonDataLineToSample reads frametime and timestamp", () => {
    const layout = parsePresentMonHeader("A,B,MsBetweenPresents,CPUStartQPCTime")!;
    const cells = ["cs2", "1", "16.5", "12345.25"];
    const sample = presentMonDataLineToSample(layout, cells);
    expect(sample).not.toBeNull();
    expect(sample!.frametimeMs).toBe(16.5);
    expect(sample!.timestampQpcOrUnix).toBe(12345.25);
  });
});

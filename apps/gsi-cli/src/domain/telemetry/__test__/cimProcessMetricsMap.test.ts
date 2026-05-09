import { describe, expect, it } from "vitest";
import {
  mapCimProcessJsonToOsSample,
  parseCimProcessJsonPayload,
} from "../cimProcessMetricsMap";

describe("cimProcessMetricsMap", () => {
  it("converts WMI 100-ns times to milliseconds", () => {
    const sample = mapCimProcessJsonToOsSample({
      KernelModeTime: 100000,
      UserModeTime: 50000,
    });
    expect(sample.kernelTimeMs).toBe(10);
    expect(sample.userTimeMs).toBe(5);
  });

  it("maps memory and I/O fields", () => {
    const sample = mapCimProcessJsonToOsSample({
      WorkingSetSize: 4096,
      PrivatePageCount: 8192,
      ReadTransferCount: 100,
      WriteTransferCount: 200,
      OtherTransferCount: 300,
    });
    expect(sample.workingSetBytes).toBe(4096);
    expect(sample.privateBytes).toBe(8192);
    expect(sample.ioReadBytes).toBe(100);
    expect(sample.ioWriteBytes).toBe(200);
    expect(sample.ioOtherBytes).toBe(300);
  });

  it("parseCimProcessJsonPayload returns null on empty string", () => {
    expect(parseCimProcessJsonPayload("")).toBeNull();
  });

  it("parseCimProcessJsonPayload parses empty object", () => {
    expect(parseCimProcessJsonPayload("{}")).toEqual({});
  });
});

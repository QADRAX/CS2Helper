import { describe, expect, it } from "vitest";
import { CliAppService } from "../../../CliAppService";
import { WindowsCimOsProcessMetricsAdapter } from "../WindowsCimOsProcessMetricsAdapter";

describe("WindowsCimOsProcessMetricsAdapter", () => {
  it("throws on non-Windows", async () => {
    if (process.platform === "win32") {
      return;
    }
    const adapter = new WindowsCimOsProcessMetricsAdapter(new CliAppService());
    await expect(adapter.sample(4)).rejects.toThrow(/requires Windows/);
  });

  it("rejects invalid pid", async () => {
    if (process.platform !== "win32") {
      return;
    }
    const adapter = new WindowsCimOsProcessMetricsAdapter(new CliAppService());
    await expect(adapter.sample(0)).rejects.toThrow(/Invalid process id/);
    await expect(adapter.sample(-1)).rejects.toThrow(/Invalid process id/);
  });

  it("returns metrics for System process (pid 4) on Windows", async () => {
    if (process.platform !== "win32") {
      return;
    }
    const adapter = new WindowsCimOsProcessMetricsAdapter(new CliAppService());
    const sample = await adapter.sample(4);
    expect(sample.workingSetBytes).toBeDefined();
    expect(sample.workingSetBytes).toBeGreaterThan(0);
  });
});

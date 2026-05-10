import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import type { PowerShellCommandPort } from "@cs2helper/shared";
import { WindowsCimOsProcessMetricsAdapter } from "../WindowsCimOsProcessMetricsAdapter";

const execFileAsync = promisify(execFile);

const powershellPort: PowerShellCommandPort = {
  async runCommand(script: string): Promise<string> {
    const { stdout } = await execFileAsync(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", script],
      {
        windowsHide: true,
        maxBuffer: 16 * 1024 * 1024,
        encoding: "utf8",
      }
    );
    return (stdout as string).trim();
  },
};

describe("WindowsCimOsProcessMetricsAdapter", () => {
  it("throws on non-Windows", async () => {
    if (process.platform === "win32") {
      return;
    }
    const adapter = new WindowsCimOsProcessMetricsAdapter(powershellPort);
    await expect(adapter.sample(4)).rejects.toThrow(/requires Windows/);
  });

  it("rejects invalid pid", async () => {
    if (process.platform !== "win32") {
      return;
    }
    const adapter = new WindowsCimOsProcessMetricsAdapter(powershellPort);
    await expect(adapter.sample(0)).rejects.toThrow(/Invalid process id/);
    await expect(adapter.sample(-1)).rejects.toThrow(/Invalid process id/);
  });

  it("returns metrics for System process (pid 4) on Windows", async () => {
    if (process.platform !== "win32") {
      return;
    }
    const adapter = new WindowsCimOsProcessMetricsAdapter(powershellPort);
    const sample = await adapter.sample(4);
    expect(sample.workingSetBytes).toBeDefined();
    expect(sample.workingSetBytes).toBeGreaterThan(0);
  });
});

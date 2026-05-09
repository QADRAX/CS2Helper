import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Runs a PowerShell script non-interactively and returns trimmed UTF-8 stdout.
 */
export async function runPowerShellCommand(script: string): Promise<string> {
  const { stdout } = await execFileAsync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-Command", script],
    {
      windowsHide: true,
      maxBuffer: 16 * 1024 * 1024,
      encoding: "utf8",
    }
  );
  return stdout.trim();
}

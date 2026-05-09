import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Non-interactive PowerShell client for running `-Command` script blocks (telemetry adapters, etc.).
 */
export class CliAppService {
  /**
   * Runs a PowerShell script and returns trimmed UTF-8 stdout.
   */
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
    return stdout.trim();
  }
}

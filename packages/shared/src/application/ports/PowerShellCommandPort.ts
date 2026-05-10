/**
 * Runs a non-interactive PowerShell `-Command` script block and returns trimmed stdout.
 * Host CLIs typically implement this via `powershell.exe` (e.g. `CliAppService` in gsi-cli).
 */
export interface PowerShellCommandPort {
  runCommand(script: string): Promise<string>;
}

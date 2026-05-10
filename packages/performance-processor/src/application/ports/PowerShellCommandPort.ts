/**
 * Runs a non-interactive PowerShell `-Command` script block and returns trimmed stdout.
 * Host apps typically implement this via `powershell.exe` (see gsi-cli `CliAppService`).
 */
export interface PowerShellCommandPort {
  runCommand(script: string): Promise<string>;
}

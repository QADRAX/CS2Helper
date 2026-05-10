import type {
  OsProcessMetricsPort,
  OsProcessMetricsSample,
} from "../../../application/ports";
import {
  mapCimProcessJsonToOsSample,
  parseCimProcessJsonPayload,
} from "../../../domain/telemetry/cimProcessMetricsMap";
import { assertPositiveIntegerPid, requireWin32 } from "../../../domain/platform/requireWin32";
import type { PowerShellCommandPort } from "@cs2helper/shared";

/**
 * Windows implementation using `Win32_Process` (CIM) for kernel/user time, working
 * set, private bytes, and cumulative I/O transfer counts.
 */
export class WindowsCimOsProcessMetricsAdapter implements OsProcessMetricsPort {
  constructor(private readonly powershell: PowerShellCommandPort) {}

  async sample(pid: number): Promise<OsProcessMetricsSample> {
    requireWin32("WindowsCimOsProcessMetricsAdapter");
    assertPositiveIntegerPid(pid);

    const script = [
      "$ErrorActionPreference='Stop'",
      `$p = Get-CimInstance -ClassName Win32_Process -Filter "ProcessId=${pid}"`,
      "if ($null -eq $p) { '{}' } else {",
      "  $p | Select-Object KernelModeTime,UserModeTime,WorkingSetSize,PrivatePageCount,ReadTransferCount,WriteTransferCount,OtherTransferCount | ConvertTo-Json -Compress",
      "}",
    ].join("; ");

    const out = await this.powershell.runCommand(script);
    const payload = parseCimProcessJsonPayload(out);
    if (payload === null) {
      return {};
    }
    if (Array.isArray(payload)) {
      return payload[0] !== undefined ? mapCimProcessJsonToOsSample(payload[0]) : {};
    }
    return mapCimProcessJsonToOsSample(payload);
  }
}

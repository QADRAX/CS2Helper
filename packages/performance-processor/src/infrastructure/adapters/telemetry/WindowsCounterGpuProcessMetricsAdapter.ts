import type {
  GpuProcessMetricsPort,
  GpuProcessMetricsSample,
} from "../../../application/ports";
import {
  mapGpuCounterJsonToSample,
  parseGpuCounterJsonPayload,
} from "../../../domain/telemetry/gpuCounterMetricsMap";
import { assertPositiveIntegerPid, requireWin32 } from "../../../domain/platform/requireWin32";
import type { PowerShellCommandPort } from "@cs2helper/shared";

/**
 * Samples WDDM GPU metrics for a PID via `Get-Counter` (en-US paths) and falls back to
 * CIM `Win32_PerfFormattedData_GPUPerformanceCounters_*` (often works when PDH paths
 * are localized). Instance names look like `pid_<pid>_engtype_3D` or `pid_<pid>_luid_…`;
 * matching must allow `_` after the pid digit run (not only whitespace).
 */
export class WindowsCounterGpuProcessMetricsAdapter implements GpuProcessMetricsPort {
  constructor(private readonly powershell: PowerShellCommandPort) {}

  async sample(pid: number): Promise<GpuProcessMetricsSample | null> {
    requireWin32("WindowsCounterGpuProcessMetricsAdapter");
    assertPositiveIntegerPid(pid);

    const script = buildGpuCounterScript(pid);
    const out = await this.powershell.runCommand(script);
    const payload = parseGpuCounterJsonPayload(out);
    if (payload === null) {
      return null;
    }
    return mapGpuCounterJsonToSample(payload);
  }
}

function buildGpuCounterScript(pid: number): string {
  return [
    "$ErrorActionPreference='Continue'",
    `$targetPid=${pid}`,
    // After `pid_<n>` comes `_engtype_…`, `_luid_…`, etc. — not whitespace.
    'function MatchPid([string]$inst) { return -not [string]::IsNullOrEmpty($inst) -and $inst -match ("pid_" + $targetPid + "(_|$|\\!)") }',
    "$dedic=$null; $share=$null; $util=$null",
    "try {",
    "  $c = Get-Counter '\\GPU Process Memory(*)\\Dedicated Usage','\\GPU Process Memory(*)\\Shared Usage' -ErrorAction SilentlyContinue",
    "  if ($null -ne $c) {",
    "    foreach ($s in $c.CounterSamples) {",
    "      if (MatchPid $s.InstanceName) {",
    "        if ($s.Path -like '*Dedicated Usage*') { $dedic = [double]$s.CookedValue }",
    "        elseif ($s.Path -like '*Shared Usage*') { $share = [double]$s.CookedValue }",
    "      }",
    "    }",
    "  }",
    "} catch { }",
    "try {",
    "  $c2 = Get-Counter '\\GPU Engine(*)\\Utilization Percentage' -ErrorAction SilentlyContinue",
    "  if ($null -ne $c2) {",
    "    foreach ($s in $c2.CounterSamples) {",
    "      if (MatchPid $s.InstanceName) {",
    "        $v = [double]$s.CookedValue",
    "        if ($null -eq $util -or $v -gt $util) { $util = $v }",
    "      }",
    "    }",
    "  }",
    "} catch { }",
    "if ($null -eq $dedic -and $null -eq $share -and $null -eq $util) {",
    "  try {",
    "    $eng = Get-CimInstance -Namespace root/cimv2 -ClassName Win32_PerfFormattedData_GPUPerformanceCounters_GPUEngine -ErrorAction SilentlyContinue",
    "    foreach ($e in @($eng)) {",
    "      if (MatchPid $e.Name) {",
    "        $v = [double]$e.UtilizationPercentage",
    "        if ($null -eq $util -or $v -gt $util) { $util = $v }",
    "      }",
    "    }",
    "  } catch { }",
    "  try {",
    "    $mem = Get-CimInstance -Namespace root/cimv2 -ClassName Win32_PerfFormattedData_GPUPerformanceCounters_GPUProcessMemory -ErrorAction SilentlyContinue",
    "    foreach ($m in @($mem)) {",
    "      if (MatchPid $m.Name) {",
    "        if ($null -ne $m.DedicatedUsage) { $dedic = [double]$m.DedicatedUsage }",
    "        if ($null -ne $m.SharedUsage) { $share = [double]$m.SharedUsage }",
    "      }",
    "    }",
    "  } catch { }",
    "}",
    "$obj = [ordered]@{ dedicatedMemoryBytes = $dedic; sharedMemoryBytes = $share; gpuUtilizationPercent = $util }",
    "if ($null -eq $dedic -and $null -eq $share -and $null -eq $util) { '{}' } else { $obj | ConvertTo-Json -Compress }",
  ].join("; ");
}

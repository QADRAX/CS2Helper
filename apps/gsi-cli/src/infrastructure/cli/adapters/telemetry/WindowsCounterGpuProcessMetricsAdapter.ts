import type {
  GpuProcessMetricsPort,
  GpuProcessMetricsSample,
} from "../../../../application/cli/ports";
import {
  mapGpuCounterJsonToSample,
  parseGpuCounterJsonPayload,
} from "../../../../domain/telemetry/gpuCounterMetricsMap";
import { assertPositiveIntegerPid, requireWin32 } from "../../windows/requireWin32";
import { runPowerShellCommand } from "../../windows/runPowerShell";

/**
 * Samples WDDM performance counters for the given PID. Uses **English** PDH paths
 * (`\GPU Process Memory`, `\GPU Engine`) as on en-US Windows; localized builds
 * may return `null` until a discovery-based query is added.
 */
export class WindowsCounterGpuProcessMetricsAdapter implements GpuProcessMetricsPort {
  async sample(pid: number): Promise<GpuProcessMetricsSample | null> {
    requireWin32("WindowsCounterGpuProcessMetricsAdapter");
    assertPositiveIntegerPid(pid);

    const script = buildGpuCounterScript(pid);
    const out = await runPowerShellCommand(script);
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
    'function MatchPid([string]$inst) { return $null -ne $inst -and $inst -match ("pid_" + $targetPid + "(\\s|$|\\!)") }',
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
    "$obj = [ordered]@{ dedicatedMemoryBytes = $dedic; sharedMemoryBytes = $share; gpuUtilizationPercent = $util }",
    "if ($null -eq $dedic -and $null -eq $share -and $null -eq $util) { '{}' } else { $obj | ConvertTo-Json -Compress }",
  ].join("; ");
}

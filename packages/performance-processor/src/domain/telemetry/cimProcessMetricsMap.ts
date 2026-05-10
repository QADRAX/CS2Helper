import type { OsProcessMetricsSample } from "./osProcessMetrics";

/** WMI `Win32_Process` time fields are in 100-ns intervals. */
const WMI_TIME_100NS_TO_MS = 1 / 10_000;

function readFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function pick(obj: Record<string, unknown>, ...candidates: string[]): unknown {
  const keys = Object.keys(obj);
  for (const want of candidates) {
    const lower = want.toLowerCase();
    for (const k of keys) {
      if (k.toLowerCase() === lower) return obj[k];
    }
  }
  return undefined;
}

/**
 * Maps `Get-CimInstance Win32_Process` JSON (one row) into {@link OsProcessMetricsSample}.
 */
export function mapCimProcessJsonToOsSample(raw: unknown): OsProcessMetricsSample {
  if (raw === null || typeof raw !== "object") {
    return {};
  }

  const row = raw as Record<string, unknown>;
  const kernel100ns = readFiniteNumber(pick(row, "KernelModeTime"));
  const user100ns = readFiniteNumber(pick(row, "UserModeTime"));
  const workingSet = readFiniteNumber(pick(row, "WorkingSetSize"));
  const privateBytes = readFiniteNumber(pick(row, "PrivatePageCount"));
  const ioRead = readFiniteNumber(pick(row, "ReadTransferCount"));
  const ioWrite = readFiniteNumber(pick(row, "WriteTransferCount"));
  const ioOther = readFiniteNumber(pick(row, "OtherTransferCount"));

  const sample: OsProcessMetricsSample = {};
  if (kernel100ns !== undefined) sample.kernelTimeMs = kernel100ns * WMI_TIME_100NS_TO_MS;
  if (user100ns !== undefined) sample.userTimeMs = user100ns * WMI_TIME_100NS_TO_MS;
  if (workingSet !== undefined) sample.workingSetBytes = Math.round(workingSet);
  if (privateBytes !== undefined) sample.privateBytes = Math.round(privateBytes);
  if (ioRead !== undefined) sample.ioReadBytes = Math.round(ioRead);
  if (ioWrite !== undefined) sample.ioWriteBytes = Math.round(ioWrite);
  if (ioOther !== undefined) sample.ioOtherBytes = Math.round(ioOther);
  return sample;
}

export function parseCimProcessJsonPayload(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

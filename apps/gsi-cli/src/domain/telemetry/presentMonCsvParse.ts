import type { PresentFrameSample } from "./presentChain";

export function splitPresentMonCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  result.push(current);
  return result;
}

function findColumnIndex(header: string[], ...candidates: string[]): number {
  const normalized = header.map((h) => h.trim().toLowerCase());
  for (const c of candidates) {
    const want = c.trim().toLowerCase();
    const i = normalized.indexOf(want);
    if (i >= 0) return i;
  }
  return -1;
}

export function parsePresentMonHeader(headerLine: string): {
  names: string[];
  msBetweenPresents: number;
  cpuStartQpcMs: number;
} | null {
  const names = splitPresentMonCsvLine(headerLine).map((h) => h.replace(/^\ufeff/, "").trim());
  if (names.length === 0 || !names[0]) {
    return null;
  }
  const msBetweenPresents = findColumnIndex(names, "MsBetweenPresents");
  const cpuStartQpcMs = findColumnIndex(names, "CPUStartQPCTime", "CPUStartTime");
  if (msBetweenPresents < 0 && cpuStartQpcMs < 0) {
    return null;
  }
  return {
    names,
    msBetweenPresents,
    cpuStartQpcMs,
  };
}

function parseNumberCell(cell: string): number | undefined {
  const t = cell.trim();
  if (t.length === 0 || t === "NA" || t.toLowerCase() === "nan") {
    return undefined;
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

export function presentMonDataLineToSample(
  layout: { msBetweenPresents: number; cpuStartQpcMs: number },
  cells: string[]
): PresentFrameSample | null {
  let frametimeMs: number | undefined;
  if (layout.msBetweenPresents >= 0) {
    frametimeMs = parseNumberCell(cells[layout.msBetweenPresents] ?? "");
  }
  let timestampQpcOrUnix: number | undefined;
  if (layout.cpuStartQpcMs >= 0) {
    timestampQpcOrUnix = parseNumberCell(cells[layout.cpuStartQpcMs] ?? "");
  }
  if (frametimeMs === undefined && timestampQpcOrUnix === undefined) {
    return null;
  }
  const sample: PresentFrameSample = {};
  if (frametimeMs !== undefined) sample.frametimeMs = frametimeMs;
  if (timestampQpcOrUnix !== undefined) sample.timestampQpcOrUnix = timestampQpcOrUnix;
  return sample;
}

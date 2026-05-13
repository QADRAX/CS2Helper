export type SteamProgressParse = {
  percent: number | null;
  bytesDownloaded?: number;
  bytesTotal?: number;
  stage?: string;
  lastLine?: string;
};

export type SteamProgressState = {
  percent: number | null;
  bytesDownloaded?: number;
  bytesTotal?: number;
  stage?: string;
  lastLine?: string;
  updatedAt: number;
};

export type SteamProgressSnapshot = {
  percent: number | null;
  bytesDownloaded?: number;
  bytesTotal?: number;
  stage?: string;
  lastLine?: string;
  updatedAt: string;
};

export const roundPct = (n: number): number => Math.round(n * 100) / 100;

export const mergeSteamProgress = (
  prev: SteamProgressState | null,
  incoming: SteamProgressParse | null
): SteamProgressState | null => {
  if (!incoming) return prev;
  return {
    percent: incoming.percent ?? prev?.percent ?? null,
    bytesDownloaded: incoming.bytesDownloaded ?? prev?.bytesDownloaded,
    bytesTotal: incoming.bytesTotal ?? prev?.bytesTotal,
    stage: incoming.stage ?? prev?.stage,
    lastLine: incoming.lastLine ?? prev?.lastLine,
    updatedAt: Date.now(),
  };
};

/**
 * Parses typical steamcmd lines, e.g.
 *   Update state (0x61) downloading, progress: 12.34 (1048576 / 2000000000)
 */
export const parseSteamcmdLine = (line: string): SteamProgressParse | null => {
  const trimmed = line.replace(/\r$/, "").trimEnd();
  if (!trimmed) return null;

  const stageMatch = trimmed.match(/Update state\s+\(0x[0-9a-fA-F]+\)\s+([^,]+)/i);
  const stage = stageMatch ? stageMatch[1].trim() : undefined;

  const progMatch = trimmed.match(/progress:\s*([\d.]+)\s*\(\s*(\d+)\s*\/\s*(\d+)\s*\)/i);
  if (progMatch) {
    const valveMid = Number.parseFloat(progMatch[1]);
    const a = Number.parseInt(progMatch[2], 10);
    const b = Number.parseInt(progMatch[3], 10);
    let percent: number | null = null;
    if (Number.isFinite(a) && Number.isFinite(b) && b > 0) {
      percent = Math.min(100, Math.max(0, (100 * a) / b));
    } else if (Number.isFinite(valveMid) && valveMid >= 0 && valveMid <= 100) {
      percent = valveMid;
    }
    return {
      percent,
      bytesDownloaded: Number.isFinite(a) ? a : undefined,
      bytesTotal: Number.isFinite(b) ? b : undefined,
      stage,
      lastLine: trimmed.length > 280 ? `${trimmed.slice(0, 280)}…` : trimmed,
    };
  }

  if (stage) {
    return {
      percent: null,
      stage,
      lastLine: trimmed.length > 280 ? `${trimmed.slice(0, 280)}…` : trimmed,
    };
  }

  if (/Success!\s+App/i.test(trimmed)) {
    return {
      percent: 100,
      stage: "success",
      lastLine: trimmed.length > 280 ? `${trimmed.slice(0, 280)}…` : trimmed,
    };
  }

  return null;
};

export const snapshotSteamProgress = (
  updateProgress: SteamProgressState | null
): SteamProgressSnapshot | null => {
  if (!updateProgress) return null;
  return {
    percent: updateProgress.percent != null ? roundPct(updateProgress.percent) : null,
    bytesDownloaded: updateProgress.bytesDownloaded,
    bytesTotal: updateProgress.bytesTotal,
    stage: updateProgress.stage,
    lastLine: updateProgress.lastLine,
    updatedAt: new Date(updateProgress.updatedAt).toISOString(),
  };
};

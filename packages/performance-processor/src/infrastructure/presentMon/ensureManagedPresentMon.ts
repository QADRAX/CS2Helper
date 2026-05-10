import { createHash } from "node:crypto";
import fs from "fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { getManagedPresentMonExecutablePath, getPresentMonInstallDir } from "./presentMonPaths";
import { readPresentMonManifest, writePresentMonManifest } from "./presentMonManifest";
import { pickWindowsPresentMonAsset, parseGithubAssetDigestSha256 } from "./pickPresentMonAsset";
import type { GitHubLatestRelease } from "./presentMonTypes";
import type {
  PresentMonBootstrapOptions,
  PresentMonBootstrapProgressEvent,
} from "../../application/ports/PresentMonBootstrapPort";

const RELEASES_LATEST_API =
  "https://api.github.com/repos/GameTechDev/PresentMon/releases/latest";

/** Minimum time between unauthenticated GitHub API calls (rate limit). */
const REMOTE_CHECK_INTERVAL_MS = 15 * 60 * 1000;

let inFlight: Promise<void> | null = null;

function envOverridesManagedPath(): boolean {
  const a = process.env.CS2HELPER_PRESENTMON_PATH?.trim();
  const b = process.env.PRESENTMON_PATH?.trim();
  return Boolean(a || b);
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function sha256File(filePath: string): Promise<string> {
  const hash = createHash("sha256");
  hash.update(await fs.readFile(filePath));
  return hash.digest("hex");
}

async function downloadToFile(url: string, destPath: string): Promise<void> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "CS2Helper-gsi-cli-presentmon-bootstrap",
    },
  });
  if (!res.ok) {
    throw new Error(`PresentMon download failed: HTTP ${res.status} ${res.statusText}`);
  }
  if (!res.body) {
    throw new Error("PresentMon download failed: empty response body");
  }
  const tmpPath = `${destPath}.partial`;
  try {
    const nodeReadable = Readable.fromWeb(res.body as import("node:stream/web").ReadableStream);
    await pipeline(nodeReadable, createWriteStream(tmpPath));
    await fs.rename(tmpPath, destPath);
  } catch (err) {
    await fs.rm(tmpPath, { force: true }).catch(() => {});
    throw err;
  }
}

async function fetchLatestRelease(): Promise<GitHubLatestRelease> {
  const res = await fetch(RELEASES_LATEST_API, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "CS2Helper-gsi-cli-presentmon-bootstrap",
    },
  });
  if (!res.ok) {
    throw new Error(`PresentMon release metadata failed: HTTP ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<GitHubLatestRelease>;
}

/**
 * Ensures the managed copy of PresentMon under `%APPDATA%\\CS2Helper\\gsi-cli\\presentmon\\PresentMon.exe`
 * exists and is refreshed when the GitHub latest release changes.
 *
 * Skips when `CS2HELPER_PRESENTMON_PATH` / `PRESENTMON_PATH` is set, or when not on Windows.
 * Remote checks are debounced unless {@link PresentMonBootstrapOptions.forceRemoteCheck} is set.
 */
export async function ensureManagedPresentMon(
  options?: PresentMonBootstrapOptions
): Promise<void> {
  const report = (event: PresentMonBootstrapProgressEvent): void => {
    options?.onProgress?.(event);
  };

  if (process.platform !== "win32") {
    report({ kind: "skipped_non_windows" });
    return;
  }
  if (envOverridesManagedPath()) {
    report({ kind: "skipped_env_override" });
    return;
  }

  if (inFlight) return inFlight;

  inFlight = (async () => {
    report({ kind: "started" });
    const dir = getPresentMonInstallDir();
    const exePath = getManagedPresentMonExecutablePath();
    await fs.mkdir(dir, { recursive: true });

    const manifest = await readPresentMonManifest();
    const exeOk = await pathExists(exePath);
    const now = Date.now();
    const staleRemote =
      Boolean(options?.forceRemoteCheck) ||
      !manifest ||
      !exeOk ||
      now - manifest.lastRemoteCheckEpochMs > REMOTE_CHECK_INTERVAL_MS;

    if (!staleRemote && exeOk) {
      report({ kind: "using_local_binary" });
      return;
    }

    report({ kind: "checking_release" });

    let release: GitHubLatestRelease;
    try {
      release = await fetchLatestRelease();
    } catch (err) {
      if (exeOk) {
        report({ kind: "using_local_binary" });
        return;
      }
      throw err;
    }

    const asset = pickWindowsPresentMonAsset(release.assets);
    if (!asset) {
      if (exeOk) {
        report({ kind: "using_local_binary" });
        return;
      }
      throw new Error("PresentMon release has no Windows standalone .exe asset");
    }

    const expectedHex = parseGithubAssetDigestSha256(asset.digest ?? undefined);

    if (exeOk && manifest?.tagName === release.tag_name) {
      if (expectedHex !== undefined && manifest.digestSha256 === expectedHex) {
        await writePresentMonManifest({
          tagName: release.tag_name,
          assetName: asset.name,
          digestSha256: expectedHex,
          lastRemoteCheckEpochMs: now,
        });
        report({ kind: "using_local_binary" });
        return;
      }
      if (expectedHex === undefined && manifest.digestSha256) {
        const diskHash = await sha256File(exePath);
        if (diskHash === manifest.digestSha256) {
          await writePresentMonManifest({
            ...manifest,
            lastRemoteCheckEpochMs: now,
          });
          report({ kind: "using_local_binary" });
          return;
        }
      }
    }

    report({ kind: "downloading" });
    await downloadToFile(asset.browser_download_url, exePath);

    report({ kind: "verifying_binary" });
    const finalHash = await sha256File(exePath);
    if (expectedHex !== undefined && finalHash !== expectedHex) {
      await fs.rm(exePath, { force: true }).catch(() => {});
      throw new Error("PresentMon download SHA-256 mismatch");
    }

    await writePresentMonManifest({
      tagName: release.tag_name,
      assetName: asset.name,
      digestSha256: finalHash,
      lastRemoteCheckEpochMs: now,
    });
    report({ kind: "using_local_binary" });
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}

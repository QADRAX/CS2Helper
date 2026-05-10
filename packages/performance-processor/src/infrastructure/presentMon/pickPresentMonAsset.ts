import type { GitHubReleaseAsset } from "./presentMonTypes";

/**
 * Selects the standalone PresentMon CLI executable for this Windows architecture.
 *
 * @param arch - Defaults to `process.arch` (Node). In tests, pass `"ia32"` or `"x64"` explicitly.
 */
export function pickWindowsPresentMonAsset(
  assets: GitHubReleaseAsset[],
  arch: string = process.arch
): GitHubReleaseAsset | null {
  const suffix = arch === "ia32" ? "-x86.exe" : "-x64.exe";
  return assets.find((a) => a.name.endsWith(suffix)) ?? null;
}

export function parseGithubAssetDigestSha256(digest: string | null | undefined): string | undefined {
  if (!digest?.trim()) return undefined;
  const prefix = "sha256:";
  const t = digest.trim();
  return t.startsWith(prefix) ? t.slice(prefix.length) : t;
}

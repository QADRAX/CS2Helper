export interface PresentMonLocalManifest {
  tagName: string;
  assetName: string;
  digestSha256: string;
  lastRemoteCheckEpochMs: number;
}

export interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
  digest?: string | null;
}

export interface GitHubLatestRelease {
  tag_name: string;
  assets: GitHubReleaseAsset[];
}

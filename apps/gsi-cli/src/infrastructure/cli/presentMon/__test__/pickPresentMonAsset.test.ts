import { describe, expect, it } from "vitest";
import { parseGithubAssetDigestSha256, pickWindowsPresentMonAsset } from "../pickPresentMonAsset";

describe("pickWindowsPresentMonAsset", () => {
  const assets = [
    { name: "PresentMon-v2.4.1.msi", browser_download_url: "https://example/msi" },
    { name: "PresentMon-2.4.1-x86.exe", browser_download_url: "https://example/x86" },
    { name: "PresentMon-2.4.1-x64.exe", browser_download_url: "https://example/x64" },
  ];

  it("selects x64 when arch is not ia32", () => {
    expect(pickWindowsPresentMonAsset(assets, "x64")?.browser_download_url).toBe("https://example/x64");
  });

  it("selects x86 when arch is ia32", () => {
    expect(pickWindowsPresentMonAsset(assets, "ia32")?.browser_download_url).toBe("https://example/x86");
  });
});

describe("parseGithubAssetDigestSha256", () => {
  it("strips sha256: prefix", () => {
    expect(parseGithubAssetDigestSha256("sha256:abc")).toBe("abc");
  });
});

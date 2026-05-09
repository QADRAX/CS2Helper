import fs from "fs/promises";
import type { PresentMonLocalManifest } from "./presentMonTypes";
import { getPresentMonManifestPath } from "./presentMonPaths";

export async function readPresentMonManifest(): Promise<PresentMonLocalManifest | null> {
  try {
    const raw = await fs.readFile(getPresentMonManifestPath(), "utf8");
    const parsed = JSON.parse(raw) as PresentMonLocalManifest;
    if (
      typeof parsed.tagName === "string" &&
      typeof parsed.digestSha256 === "string" &&
      typeof parsed.lastRemoteCheckEpochMs === "number"
    ) {
      return parsed;
    }
  } catch {
    // missing or invalid
  }
  return null;
}

export async function writePresentMonManifest(manifest: PresentMonLocalManifest): Promise<void> {
  await fs.writeFile(getPresentMonManifestPath(), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

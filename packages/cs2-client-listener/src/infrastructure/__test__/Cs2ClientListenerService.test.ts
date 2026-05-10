import { readFileSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import type { PowerShellCommandPort } from "@cs2helper/shared";
import { Cs2ClientListenerService } from "../Cs2ClientListenerService";

const __dirname = dirname(fileURLToPath(import.meta.url));
const minimalGsiBody = readFileSync(join(__dirname, "fixtures", "minimalGsiPost.json"), "utf8");

describe("Cs2ClientListenerService", () => {
  it("starts gateway + performance, streams ticks, records JSONL, and stops", async () => {
    const powershell: PowerShellCommandPort = {
      runCommand: vi.fn().mockResolvedValue(""),
    };

    const svc = new Cs2ClientListenerService(powershell, { gateway: { port: 0 } });
    const { gatewayPort } = await svc.start();
    expect(gatewayPort).toBeGreaterThan(0);

    const dir = await mkdtemp(join(tmpdir(), "cs2-listener-"));
    const recordingPath = join(dir, "out.jsonl");

    try {
      svc.startRecording(recordingPath);

      const listener = vi.fn();
      svc.subscribeTickFrames(listener);

      const res = await fetch(`http://127.0.0.1:${gatewayPort}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: minimalGsiBody,
      });
      expect(res.status).toBe(204);

      await new Promise((r) => setTimeout(r, 500));

      expect(listener.mock.calls.length).toBeGreaterThanOrEqual(1);
      const frame = listener.mock.calls[0][0];
      expect(JSON.parse((frame.master as { raw: string }).raw)).toEqual(JSON.parse(minimalGsiBody));
      expect(frame.sources).toBeDefined();

      const raw = await readFile(recordingPath, "utf8");
      expect(raw.trim().length).toBeGreaterThan(0);

      await svc.stopRecording();
      await svc.stop();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("rejects start when already running", async () => {
    const powershell: PowerShellCommandPort = { runCommand: vi.fn().mockResolvedValue("") };
    const svc = new Cs2ClientListenerService(powershell, { gateway: { port: 0 } });
    await svc.start();
    await expect(svc.start()).rejects.toThrow(/already running/i);
    await svc.stop();
  });
});

import type { IncomingMessage, ServerResponse } from "node:http";
import type { DedicatedStatusHttpApplication } from "./DedicatedStatusHttpApplication";

export type StatusSseOptions = {
  /** Milliseconds between snapshots; caller should clamp (e.g. min 200). */
  intervalMs: number;
  /** If true, skip a frame when the JSON snapshot is identical to the previous one. */
  coalesce: boolean;
};

/**
 * Opens a long-lived Server-Sent Events response: repeated `data:` lines with the same JSON as `GET /`.
 * Stops when the client disconnects or the response ends.
 */
export const startStatusSse = (
  req: IncomingMessage,
  res: ServerResponse,
  app: DedicatedStatusHttpApplication,
  options: StatusSseOptions
): void => {
  let lastSerialized = "";
  let seq = 0;
  let busy = false;

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write(": stream open\n\n");

  const send = async (): Promise<void> => {
    if (busy || req.destroyed || res.writableEnded) return;
    busy = true;
    try {
      const payload = await app.getRootStatusJson();
      const line = JSON.stringify(payload);
      if (options.coalesce && line === lastSerialized) return;
      lastSerialized = line;
      seq += 1;
      res.write(`id: ${seq}\ndata: ${line}\n\n`);
    } catch {
      if (!res.writableEnded) {
        res.write(`event: error\ndata: ${JSON.stringify({ error: "sse_snapshot_failed" })}\n\n`);
      }
    } finally {
      busy = false;
    }
  };

  void send();
  const timer = setInterval(() => void send(), options.intervalMs);

  let cleaned = false;
  const cleanup = (): void => {
    if (cleaned) return;
    cleaned = true;
    clearInterval(timer);
    if (!res.writableEnded) res.end();
  };
  req.once("close", cleanup);
};

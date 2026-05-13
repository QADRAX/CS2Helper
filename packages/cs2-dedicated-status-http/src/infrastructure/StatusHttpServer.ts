import http from "node:http";
import type { DedicatedStatusHttpApplication } from "./DedicatedStatusHttpApplication";
import { requireAuth } from "./basicAuth";
import { startStatusSse } from "./statusSse";

const json = (res: http.ServerResponse, code: number, body: unknown): void => {
  const s = JSON.stringify(body);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(s),
  });
  res.end(s);
};

export type StatusHttpServerOptions = {
  app: DedicatedStatusHttpApplication;
  /** Both non-empty → Basic auth on all routes. Omit or use empty strings for no auth (only on trusted networks). */
  httpUser: string;
  httpPass: string;
  /** Milliseconds between SSE snapshots on `GET /events` (minimum 200 enforced in `main`). */
  sseIntervalMs: number;
  /** When true, omit an SSE frame if the JSON equals the previous frame. */
  sseCoalesce: boolean;
};

export const createStatusHttpServer = (options: StatusHttpServerOptions): http.Server => {
  const { app, httpUser, httpPass, sseIntervalMs, sseCoalesce } = options;

  return http.createServer(async (req, res) => {
    const path = req.url?.split("?")[0] ?? "/";
    if (!requireAuth(req, res, httpUser, httpPass)) return;

    if (req.method === "GET" && path === "/") {
      json(res, 200, await app.getRootStatusJson());
      return;
    }

    if (req.method === "GET" && path === "/events") {
      startStatusSse(req, res, app, { intervalMs: sseIntervalMs, coalesce: sseCoalesce });
      return;
    }

    if (req.method === "POST" && path === "/update") {
      req.on("data", () => {
        /* drain body */
      });
      req.on("end", async () => {
        if (app.isOpsLocked()) {
          json(res, 409, { ok: false, error: "operation_in_progress" });
          return;
        }
        app.lockOps();
        let updateResponseSent = false;
        try {
          await app.runForcedUpdate({
            onFirstDownloadPercentLog: () => {
              if (updateResponseSent || res.headersSent) return;
              updateResponseSent = true;
              json(res, 202, {
                ok: true,
                accepted: true,
                updating: true,
                phase: app.getPhase(),
                poll: "GET /",
                message:
                  "Update running; poll `GET /` or subscribe to `GET /events` (SSE) until phase is running or error.",
              });
            },
          });
          if (!updateResponseSent) {
            json(res, 200, { ok: true, updated: true, phase: app.getPhase() });
          }
        } catch (e) {
          app.recordOperationalFailure(e);
          if (!updateResponseSent) {
            json(res, 500, {
              ok: false,
              error: "update_failed",
              message: app.getLastUpdateError(),
              phase: app.getPhase(),
            });
          }
        } finally {
          app.unlockOps();
        }
      });
      return;
    }

    res.writeHead(req.method === "POST" || req.method === "GET" ? 404 : 405);
    res.end();
  });
};

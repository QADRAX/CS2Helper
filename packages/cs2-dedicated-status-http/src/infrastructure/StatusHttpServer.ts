import http from "node:http";
import type { DedicatedStatusHttpApplication } from "./DedicatedStatusHttpApplication";
import { requireAuth } from "./basicAuth";

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
  httpUser: string;
  httpPass: string;
};

export const createStatusHttpServer = (options: StatusHttpServerOptions): http.Server => {
  const { app, httpUser, httpPass } = options;

  return http.createServer(async (req, res) => {
    const path = req.url?.split("?")[0] ?? "/";
    if (!requireAuth(req, res, httpUser, httpPass)) return;

    if (req.method === "GET" && path === "/health") {
      json(res, 200, app.getHealthJson());
      return;
    }

    if (req.method === "GET" && path === "/ready") {
      const { statusCode, body } = await app.evaluateReady();
      json(res, statusCode, body);
      return;
    }

    if (req.method === "GET" && (path === "/" || path === "/status")) {
      json(res, 200, await app.getStatusJson());
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
        try {
          await app.runForcedUpdate();
          json(res, 200, { ok: true, updated: true, phase: app.getPhase() });
        } catch (e) {
          app.recordOperationalFailure(e);
          json(res, 500, {
            ok: false,
            error: "update_failed",
            message: app.getLastUpdateError(),
            phase: app.getPhase(),
          });
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

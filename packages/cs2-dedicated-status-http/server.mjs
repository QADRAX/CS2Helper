/**
 * Orchestrates steamcmd install + CS2 dedicated child; HTTP status with Basic auth.
 *
 * All JSON routes require Authorization: Basic (CS2_STATUS_HTTP_USER / CS2_STATUS_HTTP_PASSWORD).
 *
 * Env:
 *   CS2_STATUS_HTTP_USER, CS2_STATUS_HTTP_PASSWORD (required)
 *   CS2_INSTALL_SCRIPT, CS2_WRITE_LAUNCH_SCRIPT, CS2_CHILD_SCRIPT
 *   CS2_STATUS_PORT (default 28080)
 *   CS2_GAME_PORT / CS2_PORT — TCP probe for /ready when CS2_STATUS_TCP_PROBE=1
 *
 * Responses include phase: boot | updating | starting | running | stopped | error
 * operationInProgress: true during initial steamcmd or while POST /update runs.
 * updateProgress (during steamcmd): percent (0–100 when inferable), stage, bytes, lastLine.
 */

import crypto from "node:crypto";
import http from "node:http";
import net from "node:net";
import { spawn } from "node:child_process";

const installScript = process.env.CS2_INSTALL_SCRIPT ?? "/usr/share/cs2helper/cs2-dedicated-server/install-cs2.sh";
const writeScript = process.env.CS2_WRITE_LAUNCH_SCRIPT ?? "/usr/share/cs2helper/cs2-dedicated-server/write-cs2-exec.sh";
const childScript = process.env.CS2_CHILD_SCRIPT ?? "/run/cs2-exec.sh";

const statusPort = Number.parseInt(process.env.CS2_STATUS_PORT ?? "28080", 10);
const gamePort = Number.parseInt(process.env.CS2_GAME_PORT ?? process.env.CS2_PORT ?? "27015", 10);
const tcpProbe = process.env.CS2_STATUS_TCP_PROBE === "1";

const httpUser = process.env.CS2_STATUS_HTTP_USER ?? "";
const httpPass = process.env.CS2_STATUS_HTTP_PASSWORD ?? "";

if (!httpUser || !httpPass) {
  console.error("CS2_STATUS_HTTP_USER and CS2_STATUS_HTTP_PASSWORD must be set.");
  process.exit(1);
}

/** @type {'boot' | 'updating' | 'starting' | 'running' | 'stopped' | 'error'} */
let phase = "boot";
let lastUpdateError = null;

/** @type {import('child_process').ChildProcess | null} */
let child = null;
let childExited = true;
let stoppingForUpdate = false;

/** Blocks POST /update while initial bootstrap (steamcmd) runs. */
let opsLocked = true;

/** @type {null | { percent: number | null; bytesDownloaded?: number; bytesTotal?: number; stage?: string; lastLine?: string; updatedAt: number }} */
let updateProgress = null;

const roundPct = (n) => Math.round(n * 100) / 100;

const mergeSteamProgress = (prev, incoming) => {
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
const parseSteamcmdLine = (line) => {
  const trimmed = line.replace(/\r$/, "").trimEnd();
  if (!trimmed) return null;

  const stageMatch = trimmed.match(/Update state\s+\(0x[0-9a-fA-F]+\)\s+([^,]+)/i);
  const stage = stageMatch ? stageMatch[1].trim() : undefined;

  const progMatch = trimmed.match(/progress:\s*([\d.]+)\s*\(\s*(\d+)\s*\/\s*(\d+)\s*\)/i);
  if (progMatch) {
    const valveMid = Number.parseFloat(progMatch[1]);
    const a = Number.parseInt(progMatch[2], 10);
    const b = Number.parseInt(progMatch[3], 10);
    let percent = null;
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

const snapshotUpdateProgress = () => {
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

const timingSafeEqualStr = (a, b) => {
  const x = Buffer.from(String(a), "utf8");
  const y = Buffer.from(String(b), "utf8");
  if (x.length !== y.length) return false;
  if (x.length === 0) return false;
  return crypto.timingSafeEqual(x, y);
};

const checkBasicAuth = (req) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Basic ")) return false;
  let decoded;
  try {
    decoded = Buffer.from(h.slice(6).trim(), "base64").toString("utf8");
  } catch {
    return false;
  }
  const idx = decoded.indexOf(":");
  if (idx < 0) return false;
  const u = decoded.slice(0, idx);
  const p = decoded.slice(idx + 1);
  return timingSafeEqualStr(u, httpUser) && timingSafeEqualStr(p, httpPass);
};

const requireAuth = (req, res) => {
  if (checkBasicAuth(req)) return true;
  res.writeHead(401, {
    "WWW-Authenticate": 'Basic realm="cs2-dedicated-status"',
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify({ error: "unauthorized", message: "Basic authentication required" }));
  return false;
};

const runInstallWithProgress = () =>
  new Promise((resolve, reject) => {
    updateProgress = {
      percent: 0,
      stage: "starting_steamcmd",
      updatedAt: Date.now(),
    };

    const p = spawn("/bin/bash", [installScript], {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });

    let buf = "";

    const consumeChunk = (chunk) => {
      process.stderr.write(chunk);
      buf += chunk.toString("utf8");
      let nl;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl);
        buf = buf.slice(nl + 1);
        const parsed = parseSteamcmdLine(line);
        if (parsed) {
          updateProgress = mergeSteamProgress(updateProgress, parsed);
        }
      }
    };

    p.stdout.on("data", consumeChunk);
    p.stderr.on("data", consumeChunk);
    p.on("error", (err) => {
      updateProgress = null;
      reject(err);
    });
    p.on("exit", (code) => {
      if (buf.length > 0) {
        const parsed = parseSteamcmdLine(buf);
        if (parsed) {
          updateProgress = mergeSteamProgress(updateProgress, parsed);
        }
        buf = "";
      }
      if (code === 0) {
        updateProgress = mergeSteamProgress(updateProgress, {
          percent: updateProgress?.percent != null ? Math.min(100, updateProgress.percent) : 100,
          stage: "steamcmd_finished",
          lastLine: undefined,
        });
        resolve();
      } else {
        updateProgress = null;
        reject(new Error(`${installScript} exited with code ${code}`));
      }
    });
  });

const runBashScript = (path) =>
  new Promise((resolve, reject) => {
    const p = spawn("/bin/bash", [path], {
      stdio: "inherit",
      env: process.env,
    });
    p.on("error", reject);
    p.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${path} exited with code ${code}`));
    });
  });

const tcpReady = () =>
  new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port: gamePort }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.setTimeout(400);
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => resolve(false));
  });

const json = (res, code, body) => {
  const s = JSON.stringify(body);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(s),
  });
  res.end(s);
};

const childAlive = () => child !== null && !childExited && child.exitCode === null;

const stopChildForUpdate = () =>
  new Promise((resolve) => {
    if (!child || childExited) {
      resolve();
      return;
    }
    stoppingForUpdate = true;
    const done = () => {
      child = null;
      childExited = true;
      resolve();
    };
    child.once("exit", done);
    child.kill("SIGTERM");
    setTimeout(() => {
      try {
        child?.kill("SIGKILL");
      } catch {
        /* ignore */
      }
    }, 45000);
  });

const spawnGame = async () => {
  childExited = false;
  child = spawn(childScript, [], {
    stdio: "inherit",
    env: process.env,
  });
  child.once("exit", (code, signal) => {
    childExited = true;
    if (stoppingForUpdate) {
      return;
    }
    phase = "stopped";
    console.error(`cs2 process exited: code=${code} signal=${signal ?? "none"}`);
    process.exit(code ?? 1);
  });
  await new Promise((resolve, reject) => {
    child.once("spawn", resolve);
    child.once("error", (err) => {
      child = null;
      childExited = true;
      reject(err);
    });
  });
};

const runBootstrap = async () => {
  lastUpdateError = null;
  phase = "updating";
  await runInstallWithProgress();
  updateProgress = null;
  phase = "starting";
  await runBashScript(writeScript);
  await spawnGame();
  phase = "running";
};

const runForcedUpdate = async () => {
  lastUpdateError = null;
  phase = "updating";
  await stopChildForUpdate();
  await runInstallWithProgress();
  updateProgress = null;
  phase = "starting";
  await runBashScript(writeScript);
  await spawnGame();
  phase = "running";
};

const server = http.createServer(async (req, res) => {
  const path = req.url?.split("?")[0] ?? "/";
  if (!requireAuth(req, res)) return;

  if (req.method === "GET" && path === "/health") {
    json(res, 200, {
      ok: true,
      phase,
      updating: phase === "updating",
      operationInProgress: opsLocked,
      childPid: child?.pid ?? null,
      processUp: childAlive(),
      updateProgress: snapshotUpdateProgress(),
    });
    return;
  }

  if (req.method === "GET" && path === "/ready") {
    if (phase === "updating") {
      json(res, 503, {
        ready: false,
        reason: "updating",
        updating: true,
        updateProgress: snapshotUpdateProgress(),
      });
      return;
    }
    if (phase === "error") {
      json(res, 503, { ready: false, reason: "error", error: lastUpdateError });
      return;
    }
    if (!childAlive()) {
      json(res, 503, { ready: false, reason: "process_down", phase });
      return;
    }
    if (tcpProbe) {
      const ok = await tcpReady();
      json(res, ok ? 200 : 503, {
        ready: ok,
        reason: ok ? "ok" : "tcp_probe_failed",
        gamePort,
      });
      return;
    }
    json(res, 200, { ready: true, reason: "process_up", tcpProbe: false, phase });
    return;
  }

  if (req.method === "GET" && (path === "/" || path === "/status")) {
    json(res, 200, {
      service: "cs2-dedicated-status-http",
      phase,
      updating: phase === "updating",
      operationInProgress: opsLocked,
      ready: phase === "running" && childAlive() && (!tcpProbe || (await tcpReady())),
      lastUpdateError,
      childPid: child?.pid ?? null,
      updateProgress: snapshotUpdateProgress(),
      endpoints: {
        health: "GET /health",
        ready: "GET /ready",
        status: "GET /status",
        update: "POST /update",
      },
    });
    return;
  }

  if (req.method === "POST" && path === "/update") {
    req.on("data", () => {
      /* drain request body */
    });
    req.on("end", async () => {
      if (opsLocked) {
        json(res, 409, { ok: false, error: "operation_in_progress" });
        return;
      }
      opsLocked = true;
      try {
        await runForcedUpdate();
        json(res, 200, { ok: true, updated: true, phase });
      } catch (e) {
        phase = "error";
        lastUpdateError = e instanceof Error ? e.message : String(e);
        json(res, 500, {
          ok: false,
          error: "update_failed",
          message: lastUpdateError,
          phase,
        });
      } finally {
        opsLocked = false;
      }
    });
    return;
  }

  res.writeHead(req.method === "POST" || req.method === "GET" ? 404 : 405);
  res.end();
});

const shutdown = () => {
  if (child && !childExited) {
    child.kill("SIGTERM");
  }
  server.close(() => process.exit(0));
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

server.listen(statusPort, "0.0.0.0", () => {
  console.error(
    `status-http listening on 0.0.0.0:${statusPort} (Basic auth); install=${installScript}`,
  );
  void (async () => {
    try {
      phase = "boot";
      await runBootstrap();
    } catch (e) {
      phase = "error";
      lastUpdateError = e instanceof Error ? e.message : String(e);
      console.error("bootstrap failed:", lastUpdateError);
    } finally {
      opsLocked = false;
    }
  })();
});

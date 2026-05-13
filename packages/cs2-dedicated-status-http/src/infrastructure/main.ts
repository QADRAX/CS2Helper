import http from "node:http";
import { DedicatedStatusHttpApplication } from "./DedicatedStatusHttpApplication";
import { createStatusHttpServer } from "./StatusHttpServer";

/** Docker `env_file` + Windows CRLF often leaves `\r` on values, breaking Basic auth compares. */
const envCredential = (raw: string | undefined): string =>
  (raw ?? "").replace(/^\uFEFF/, "").replace(/\r/g, "").trimEnd();

const statusPort = Number.parseInt(process.env.CS2_STATUS_PORT ?? "28080", 10);

const httpUser = envCredential(process.env.CS2_STATUS_HTTP_USER);
const httpPass = envCredential(process.env.CS2_STATUS_HTTP_PASSWORD);

const authPartial = Boolean(httpUser) !== Boolean(httpPass);
if (authPartial) {
  console.error(
    "Set both CS2_STATUS_HTTP_USER and CS2_STATUS_HTTP_PASSWORD, or leave both unset for no Basic auth.",
  );
  process.exit(1);
}

const basicAuthEnabled = Boolean(httpUser && httpPass);

if (process.env.CS2_STATUS_HTTP_DEBUG === "1") {
  console.error(
    basicAuthEnabled
      ? `[status-http] CS2_STATUS_HTTP_DEBUG=1: userLen=${httpUser.length} passLen=${httpPass.length} (no secrets logged)`
      : "[status-http] CS2_STATUS_HTTP_DEBUG=1: Basic auth off (no credentials)",
  );
}

const app = new DedicatedStatusHttpApplication();

const sseIntervalParsed = Number.parseInt(process.env.CS2_STATUS_SSE_INTERVAL_MS ?? "", 10);
const sseIntervalMs =
  Number.isFinite(sseIntervalParsed) && sseIntervalParsed >= 200 ? sseIntervalParsed : 1000;

const sseCoalesceRaw = (process.env.CS2_STATUS_SSE_COALESCE ?? "1")
  .replace(/\r/g, "")
  .trimEnd()
  .toLowerCase();
const sseCoalesce = sseCoalesceRaw !== "0" && sseCoalesceRaw !== "false" && sseCoalesceRaw !== "no";

const server: http.Server = createStatusHttpServer({
  app,
  httpUser,
  httpPass,
  sseIntervalMs,
  sseCoalesce,
});

const shutdown = (): void => {
  app.signalShutdownGame();
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

server.listen(statusPort, "0.0.0.0", () => {
  const installScript =
    process.env.CS2_INSTALL_SCRIPT ?? "/usr/share/cs2helper/cs2-dedicated-server/install-cs2.sh";
  console.error(
    basicAuthEnabled
      ? `status-http listening on 0.0.0.0:${statusPort} (Basic auth); install=${installScript}`
      : `status-http listening on 0.0.0.0:${statusPort} (no Basic auth — do not expose ${statusPort}/tcp publicly); install=${installScript}`,
  );
  void (async () => {
    try {
      app.setPhaseBoot();
      await app.runBootstrap();
    } catch (e) {
      app.recordOperationalFailure(e);
      console.error("bootstrap failed:", app.getLastUpdateError());
    } finally {
      app.unlockOps();
    }
  })();
});

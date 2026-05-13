import http from "node:http";
import { DedicatedStatusHttpApplication } from "./DedicatedStatusHttpApplication";
import { createStatusHttpServer } from "./StatusHttpServer";

const statusPort = Number.parseInt(process.env.CS2_STATUS_PORT ?? "28080", 10);

const httpUser = process.env.CS2_STATUS_HTTP_USER ?? "";
const httpPass = process.env.CS2_STATUS_HTTP_PASSWORD ?? "";

if (!httpUser || !httpPass) {
  console.error("CS2_STATUS_HTTP_USER and CS2_STATUS_HTTP_PASSWORD must be set.");
  process.exit(1);
}

const app = new DedicatedStatusHttpApplication();
const server: http.Server = createStatusHttpServer({ app, httpUser, httpPass });

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
    `status-http listening on 0.0.0.0:${statusPort} (Basic auth); install=${installScript}`,
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

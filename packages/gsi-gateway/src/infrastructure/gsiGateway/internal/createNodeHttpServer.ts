import { createServer } from "http";
import type {
  HttpListenAddress,
  HttpServerConfig,
} from "../../../domain/gsiGateway/httpContracts";

interface CreateNodeHttpServerOptions {
  config: HttpServerConfig;
  onGsiRequest: (rawBody: string) => Promise<void>;
}

/**
 * Creates a minimal Node HTTP server that accepts CS2 GSI POST payloads.
 *
 * Requests are accepted only on `POST {config.gsiPath}` and rejected otherwise.
 * Valid payloads trigger `onGsiRequest`; malformed payloads receive HTTP 400.
 */
export function createNodeHttpServer(options: CreateNodeHttpServerOptions) {
  const { config, onGsiRequest } = options;

  const server = createServer(async (req, res) => {
    const reqUrl = req.url ?? "";
    if (req.method !== "POST" || reqUrl !== config.gsiPath) {
      res.statusCode = 404;
      res.end();
      return;
    }

    const chunks: Buffer[] = [];
    let totalBytes = 0;

    req.on("data", (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > config.maxBodyBytes) {
        res.statusCode = 413;
        res.end("Payload too large");
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("error", () => {
      if (!res.writableEnded) {
        res.statusCode = 400;
        res.end("Invalid request stream");
      }
    });

    req.on("end", async () => {
      if (res.writableEnded) return;

      try {
        const rawBody = Buffer.concat(chunks).toString("utf-8");
        await onGsiRequest(rawBody);
        res.statusCode = 204;
        res.end();
      } catch {
        res.statusCode = 400;
        res.end("Invalid GSI payload");
      }
    });
  });

  return {
    start: () =>
      new Promise<HttpListenAddress>((resolve, reject) => {
        server.once("error", reject);
        server.listen(config.port, config.host, () => {
          server.off("error", reject);
          const address = server.address();
          if (!address || typeof address === "string") {
            resolve({ host: config.host, port: config.port });
            return;
          }
          resolve({ host: config.host, port: address.port });
        });
      }),
    stop: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
  };
}

import { createServer, Server } from "http";
import type { HttpServerConfig, HttpListenAddress } from "../../../domain/gsiGateway/httpContracts";

export interface NodeHttpServerOptions {
  config: HttpServerConfig;
  onGsiRequest: (rawBody: string) => Promise<void>;
}

/**
 * Minimal Node HTTP server adapter that accepts CS2 GSI POST payloads.
 */
export class NodeHttpServerAdapter {
  private server: Server | null = null;
  private readonly config: HttpServerConfig;
  private readonly onGsiRequest: (rawBody: string) => Promise<void>;

  constructor(options: NodeHttpServerOptions) {
    this.config = options.config;
    this.onGsiRequest = options.onGsiRequest;
  }

  async start(): Promise<HttpListenAddress> {
    const HARDCODED_HOST = "127.0.0.1";
    
    this.server = createServer(async (req, res) => {
      const reqUrl = req.url ?? "";
      
      if (req.method === "POST" && reqUrl === "/") {
        let body = "";
        
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", async () => {
          try {
            await this.onGsiRequest(body);
            // GSI specs often use 204 No Content
            res.writeHead(204, { "Content-Type": "text/plain" });
            res.end();
          } catch (err) {
            const message = err instanceof Error ? err.message : "Bad Request";
            res.writeHead(400, { "Content-Type": "text/plain" });
            res.end(message);
          }
        });
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
      }
    });

    return new Promise((resolve, reject) => {
      this.server?.listen(this.config.port, HARDCODED_HOST, () => {
        const addr = this.server?.address();
        const port = (addr && typeof addr !== 'string') ? addr.port : this.config.port;
        resolve({ port });
      });
      this.server?.on("error", reject);
    });
  }

  async stop(): Promise<void> {
    if (this.server) {
      await new Promise<void>((resolve, reject) => {
        this.server?.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      this.server = null;
    }
  }
}

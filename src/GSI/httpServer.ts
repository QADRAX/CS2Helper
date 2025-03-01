/* eslint-disable no-return-assign */
import http from 'http';

export type RequestHandler = (
  body: string,
  req: http.IncomingMessage,
  res: http.ServerResponse,
) => void;

export interface HttpServer {
  listen: (callback?: () => void) => void;
  close: (callback?: () => void) => void;
}

export function createHTTPServer(
  handler: RequestHandler,
  port: number = 5000,
  host: string = '127.0.0.1',
): HttpServer {
  const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => handler(body, req, res));
    } else {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('GSI Listener running...');
    }
  });

  return {
    listen(callback?: () => void) {
      server.listen(port, host, callback);
    },
    close(callback?: () => void) {
      server.close(callback);
    },
  };
}

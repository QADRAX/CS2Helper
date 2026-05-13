import type { IncomingMessage } from "node:http";
import { basicAuthHeaderValid } from "../domain/basicAuth";

export const checkBasicAuth = (
  req: IncomingMessage,
  httpUser: string,
  httpPass: string
): boolean => basicAuthHeaderValid(req.headers.authorization, httpUser, httpPass);

/** When `httpUser` and `httpPass` are both empty, skips auth (caller should only use for local / trusted networks). */
export const requireAuth = (
  req: IncomingMessage,
  res: import("node:http").ServerResponse,
  httpUser: string,
  httpPass: string
): boolean => {
  if (!httpUser && !httpPass) return true;
  if (checkBasicAuth(req, httpUser, httpPass)) return true;
  res.writeHead(401, {
    "WWW-Authenticate": 'Basic realm="cs2-dedicated-status"',
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify({ error: "unauthorized", message: "Basic authentication required" }));
  return false;
};

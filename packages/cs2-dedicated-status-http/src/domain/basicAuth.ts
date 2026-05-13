import crypto from "node:crypto";

const timingSafeEqualStr = (a: string, b: string): boolean => {
  const x = Buffer.from(String(a), "utf8");
  const y = Buffer.from(String(b), "utf8");
  if (x.length !== y.length) return false;
  if (x.length === 0) return false;
  return crypto.timingSafeEqual(x, y);
};

/**
 * Validates `Authorization` (Basic) against expected credentials (timing-safe).
 */
export const basicAuthHeaderValid = (
  authorizationHeader: string | undefined,
  expectedUser: string,
  expectedPass: string
): boolean => {
  const h = authorizationHeader;
  if (!h || !h.startsWith("Basic ")) return false;
  let decoded: string;
  try {
    decoded = Buffer.from(h.slice(6).trim(), "base64").toString("utf8");
  } catch {
    return false;
  }
  const idx = decoded.indexOf(":");
  if (idx < 0) return false;
  const u = decoded.slice(0, idx);
  const p = decoded.slice(idx + 1);
  return timingSafeEqualStr(u, expectedUser) && timingSafeEqualStr(p, expectedPass);
};

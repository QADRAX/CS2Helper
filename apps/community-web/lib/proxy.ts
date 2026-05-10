import type { NextRequest } from "next/server";
import { loadConfig } from "./config";

/** Client IP for rate limiting when behind nginx (trusted proxy only). */
export function getClientIp(request: NextRequest): string {
  const cfg = loadConfig();
  if (cfg.trustProxy) {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim();
      if (first) return first;
    }
    const realIp = request.headers.get("x-real-ip")?.trim();
    if (realIp) return realIp;
  }
  return "local";
}

export function requestIsHttps(request: NextRequest): boolean {
  const cfg = loadConfig();
  if (cfg.trustProxy) {
    const proto = request.headers.get("x-forwarded-proto")?.toLowerCase();
    if (proto === "https") return true;
  }
  return request.nextUrl.protocol === "https:";
}

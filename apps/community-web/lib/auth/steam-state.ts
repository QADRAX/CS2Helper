import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "cs2h_steam_oid";
const MAX_AGE_SEC = 600;

export { COOKIE_NAME as STEAM_OPENID_STATE_COOKIE };

export type SteamLoginStatePayload = {
  readonly exp: number;
  readonly nonce: string;
  /** Plain invitation code (empty string if none). */
  readonly invite: string;
  /** Post-login redirect path (relative only). */
  readonly next: string;
};

function signPayload(secret: string, payloadB64: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

function sanitizeNextPath(next: string | undefined): string {
  const raw = (next ?? "").trim();
  if (!raw) return "/admin";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/admin";
  if (raw.includes("://")) return "/admin";
  if (raw.length > 2048) return "/admin";

  let path: string;
  let search: string;
  let hash: string;
  try {
    const u = new URL(raw, "https://internal.invalid/");
    path = u.pathname;
    search = u.search;
    hash = u.hash;
  } catch {
    return "/admin";
  }

  const pathLow = path.toLowerCase();
  if (
    pathLow.includes("%3c") ||
    path.includes("<") ||
    /cdata/i.test(path) ||
    /cdata/i.test(raw) ||
    /<\!\[/i.test(raw)
  ) {
    return "/admin";
  }

  const top = path.split("/").filter(Boolean)[0];
  if (top !== "admin" && top !== "login") return "/admin";

  return `${path}${search}${hash}`;
}

/**
 * Builds a signed cookie value carrying invitation (optional) until Steam redirects back.
 */
export function encodeSteamLoginState(
  secret: string,
  invitePlain: string | undefined,
  nextPath: string | undefined
): string {
  const payload: SteamLoginStatePayload = {
    exp: Date.now() + MAX_AGE_SEC * 1000,
    nonce: randomBytes(16).toString("hex"),
    invite: invitePlain?.trim() ?? "",
    next: sanitizeNextPath(nextPath),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = signPayload(secret, payloadB64);
  return `${payloadB64}.${sig}`;
}

export function decodeSteamLoginState(
  secret: string,
  cookieValue: string | undefined
): SteamLoginStatePayload | null {
  if (!cookieValue?.trim()) return null;
  const dot = cookieValue.indexOf(".");
  if (dot <= 0) return null;
  const payloadB64 = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  const expect = signPayload(secret, payloadB64);
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expect, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as SteamLoginStatePayload).exp !== "number" ||
    typeof (parsed as SteamLoginStatePayload).nonce !== "string" ||
    typeof (parsed as SteamLoginStatePayload).invite !== "string" ||
    typeof (parsed as SteamLoginStatePayload).next !== "string"
  ) {
    return null;
  }
  const p = parsed as SteamLoginStatePayload;
  if (p.exp <= Date.now()) return null;
  return { ...p, next: sanitizeNextPath(p.next) };
}

export function steamStateCookieMaxAgeSec(): number {
  return MAX_AGE_SEC;
}

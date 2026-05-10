export const COOKIE_ACCESS = "cs2h_access";
export const COOKIE_REFRESH = "cs2h_refresh";

export type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict";
  path: string;
  maxAgeSec: number;
};

export function serializeCookie(
  name: string,
  value: string,
  opts: CookieOptions
): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=" + opts.path,
    "HttpOnly",
    "SameSite=" + opts.sameSite.charAt(0).toUpperCase() + opts.sameSite.slice(1),
    `Max-Age=${opts.maxAgeSec}`,
  ];
  if (opts.secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearCookie(name: string, secure: boolean): string {
  const parts = [
    `${name}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

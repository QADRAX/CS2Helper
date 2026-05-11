import { NextRequest, NextResponse } from "next/server";
import { serializeCookie } from "@/lib/auth/cookies";
import { buildSteamOpenIdRedirectUrl, steamOpenIdRealm, steamOpenIdReturnTo } from "@/lib/auth/steam-openid-urls";
import {
  encodeSteamLoginState,
  STEAM_OPENID_STATE_COOKIE,
  steamStateCookieMaxAgeSec,
} from "@/lib/auth/steam-state";
import { loadConfig } from "@/lib/config";
import { getClientIp, requestIsHttps } from "@/lib/proxy";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const cfg = loadConfig();
  const appUrl = cfg.appUrl.trim();
  if (!appUrl) {
    return NextResponse.json({ error: "missing_app_url" }, { status: 500 });
  }

  const ip = getClientIp(request);
  if (!rateLimit(`steam_login:${ip}`, cfg.rateLimitLoginPerMinute, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const returnTo = steamOpenIdReturnTo(appUrl);
  const realm = steamOpenIdRealm(appUrl);
  const invite = request.nextUrl.searchParams.get("invite") ?? undefined;
  const nextPath = request.nextUrl.searchParams.get("next") ?? undefined;

  const secret = cfg.jwtSecret;
  if (!secret) {
    return NextResponse.json({ error: "missing_jwt_secret" }, { status: 500 });
  }

  const state = encodeSteamLoginState(secret, invite, nextPath);
  const secure = requestIsHttps(request);
  const redirectUrl = buildSteamOpenIdRedirectUrl(returnTo, realm);
  const res = NextResponse.redirect(redirectUrl, 302);
  res.headers.append(
    "Set-Cookie",
    serializeCookie(STEAM_OPENID_STATE_COOKIE, state, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAgeSec: steamStateCookieMaxAgeSec(),
    })
  );
  return res;
}

import { NextRequest, NextResponse } from "next/server";
import { AuthDomainError } from "@cs2helper/auth";
import { appendAuthTokenCookies, clearCookie } from "@/lib/auth/cookies";
import { steamOpenIdReturnTo } from "@/lib/auth/steam-openid-urls";
import { decodeSteamLoginState, STEAM_OPENID_STATE_COOKIE } from "@/lib/auth/steam-state";
import { getAuthService } from "@/lib/auth/service";
import { loadConfig } from "@/lib/config";
import { requestIsHttps } from "@/lib/proxy";

function openIdParamsFromRequest(request: NextRequest): Record<string, string> {
  const out: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

export async function GET(request: NextRequest) {
  const cfg = loadConfig();
  const appUrl = cfg.appUrl.trim();
  if (!appUrl) {
    return NextResponse.json({ error: "missing_app_url" }, { status: 500 });
  }

  const secure = requestIsHttps(request);
  const stateCookie = request.cookies.get(STEAM_OPENID_STATE_COOKIE)?.value;
  const decoded = decodeSteamLoginState(cfg.jwtSecret, stateCookie);
  if (!decoded) {
    const res = NextResponse.redirect(new URL("/login?error=steam_state_invalid", appUrl), 302);
    res.headers.append("Set-Cookie", clearCookie(STEAM_OPENID_STATE_COOKIE, secure));
    return res;
  }

  const invite =
    decoded.invite.length > 0 ? decoded.invite : undefined;
  const returnTo = steamOpenIdReturnTo(appUrl);

  try {
    const tokens = await getAuthService().completeSteamOpenIdSignIn({
      openIdParams: openIdParamsFromRequest(request),
      expectedReturnTo: returnTo,
      invitationPlainCode: invite,
      bootstrapRootSteamId: cfg.bootstrapRootSteamId || undefined,
    });

    const target = new URL(decoded.next, appUrl);
    const res = NextResponse.redirect(target, 302);
    appendAuthTokenCookies(res, tokens, secure);
    res.headers.append("Set-Cookie", clearCookie(STEAM_OPENID_STATE_COOKIE, secure));
    return res;
  } catch (e) {
    const code = e instanceof AuthDomainError ? e.code : "steam_login_failed";
    const res = NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(code)}`, appUrl), 302);
    res.headers.append("Set-Cookie", clearCookie(STEAM_OPENID_STATE_COOKIE, secure));
    return res;
  }
}

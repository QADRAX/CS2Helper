import { type NextRequest, NextResponse } from "next/server";
import { AuthDomainError } from "@cs2helper/auth";
import { COOKIE_ACCESS, COOKIE_REFRESH, serializeCookie } from "@/lib/auth/cookies";
import { getAuthService } from "@/lib/auth/service";
import { getClientIp, requestIsHttps } from "@/lib/proxy";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimit(`refresh:${ip}`, 120, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const refresh = request.cookies.get(COOKIE_REFRESH)?.value;
  if (!refresh) {
    return NextResponse.json({ error: "no_refresh" }, { status: 401 });
  }

  const secure = requestIsHttps(request);
  const cookieBase = {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
  };

  try {
    const tokens = await getAuthService().refreshAccessToken(refresh);
    const res = NextResponse.json({ ok: true });
    const accessMax = Math.max(
      60,
      Math.floor((tokens.accessTokenExpiresAt.getTime() - Date.now()) / 1000)
    );
    const refreshMax = Math.max(
      60,
      Math.floor((tokens.refreshTokenExpiresAt.getTime() - Date.now()) / 1000)
    );
    res.headers.append(
      "Set-Cookie",
      serializeCookie(COOKIE_ACCESS, tokens.accessToken, {
        ...cookieBase,
        maxAgeSec: accessMax,
      })
    );
    res.headers.append(
      "Set-Cookie",
      serializeCookie(COOKIE_REFRESH, tokens.refreshToken, {
        ...cookieBase,
        maxAgeSec: refreshMax,
      })
    );
    return res;
  } catch (e) {
    if (e instanceof AuthDomainError) {
      return NextResponse.json({ error: e.code }, { status: 401 });
    }
    throw e;
  }
}

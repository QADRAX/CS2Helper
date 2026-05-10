import { NextRequest, NextResponse } from "next/server";
import { AuthDomainError } from "@cs2helper/auth";
import { COOKIE_ACCESS, COOKIE_REFRESH, serializeCookie } from "@/lib/auth/cookies";
import { getAuthService } from "@/lib/auth/service";
import { loadConfig } from "@/lib/config";
import { getClientIp, requestIsHttps } from "@/lib/proxy";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const cfg = loadConfig();
  const ip = getClientIp(request);
  if (!rateLimit(`login:${ip}`, cfg.rateLimitLoginPerMinute, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "missing_credentials" }, { status: 400 });
  }

  const secure = requestIsHttps(request);
  const cookieBase = {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
  };

  try {
    const tokens = await getAuthService().authenticateUser(email, password);
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

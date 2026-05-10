import { NextRequest, NextResponse } from "next/server";
import { COOKIE_ACCESS, COOKIE_REFRESH, clearCookie } from "@/lib/auth/cookies";
import { getAuthService } from "@/lib/auth/service";
import { requestIsHttps } from "@/lib/proxy";

export async function POST(request: NextRequest) {
  const secure = requestIsHttps(request);
  const refresh = request.cookies.get(COOKIE_REFRESH)?.value;
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", clearCookie(COOKIE_ACCESS, secure));
  res.headers.append("Set-Cookie", clearCookie(COOKIE_REFRESH, secure));
  if (refresh) {
    try {
      await getAuthService().logout(refresh);
    } catch {
      /* ignore */
    }
  }
  return res;
}

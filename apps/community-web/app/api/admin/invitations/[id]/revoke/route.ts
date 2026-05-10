import { NextRequest, NextResponse } from "next/server";
import { AUTH_INVITATIONS_MANAGE_PERMISSION } from "@cs2helper/auth";
import { getClaimsFromRequest } from "@/lib/api-auth";
import { getAuthService } from "@/lib/auth/service";
import { loadConfig } from "@/lib/config";
import { getClientIp } from "@/lib/proxy";
import { rateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, ctx: Params) {
  const claims = await getClaimsFromRequest(request);
  if (!claims) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const cfg = loadConfig();
  const ip = getClientIp(request);
  if (!rateLimit(`admin:${claims.sub}:${ip}`, cfg.rateLimitAdminPerMinute, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const auth = getAuthService();
  try {
    await auth.assertUserHasPermission(claims.sub, AUTH_INVITATIONS_MANAGE_PERMISSION);
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  await auth.revokeInvitation(claims.sub, id);
  return NextResponse.json({ ok: true });
}

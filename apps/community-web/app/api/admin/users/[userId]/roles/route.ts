import { NextRequest, NextResponse } from "next/server";
import { AUTH_RBAC_MANAGE_PERMISSION } from "@cs2helper/auth";
import { getClaimsFromRequest } from "@/lib/api-auth";
import { getAuthService } from "@/lib/auth/service";
import { loadConfig } from "@/lib/config";
import { getClientIp } from "@/lib/proxy";
import { rateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ userId: string }> };

export async function POST(request: NextRequest, ctx: Params) {
  const claims = await getClaimsFromRequest(request);
  if (!claims) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const cfg = loadConfig();
  const ip = getClientIp(request);
  if (!rateLimit(`admin:${claims.sub}:${ip}`, cfg.rateLimitAdminPerMinute, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const { userId } = await ctx.params;
  let body: { roleName?: string };
  try {
    body = (await request.json()) as { roleName?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const roleName = body.roleName?.trim();
  if (!roleName) return NextResponse.json({ error: "missing_role" }, { status: 400 });

  const auth = getAuthService();
  try {
    await auth.assertUserHasPermission(claims.sub, AUTH_RBAC_MANAGE_PERMISSION);
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await auth.assignRoleToUser(claims.sub, userId, roleName);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, ctx: Params) {
  const claims = await getClaimsFromRequest(request);
  if (!claims) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const cfg = loadConfig();
  const ip = getClientIp(request);
  if (!rateLimit(`admin:${claims.sub}:${ip}`, cfg.rateLimitAdminPerMinute, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const roleName = request.nextUrl.searchParams.get("roleName")?.trim();
  if (!roleName) return NextResponse.json({ error: "missing_role" }, { status: 400 });
  const { userId } = await ctx.params;

  const auth = getAuthService();
  try {
    await auth.assertUserHasPermission(claims.sub, AUTH_RBAC_MANAGE_PERMISSION);
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await auth.removeRoleFromUser(claims.sub, userId, roleName);
  return NextResponse.json({ ok: true });
}

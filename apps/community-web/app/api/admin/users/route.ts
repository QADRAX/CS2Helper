import { NextRequest, NextResponse } from "next/server";
import { AUTH_RBAC_MANAGE_PERMISSION } from "@cs2helper/auth";
import { getClaimsFromRequest } from "@/lib/api-auth";
import { getAuthService } from "@/lib/auth/service";
import { loadConfig } from "@/lib/config";
import { getClientIp } from "@/lib/proxy";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const claims = await getClaimsFromRequest(request);
  if (!claims) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const cfg = loadConfig();
  const ip = getClientIp(request);
  if (!rateLimit(`admin:${claims.sub}:${ip}`, cfg.rateLimitAdminPerMinute, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const auth = getAuthService();
  try {
    await auth.assertUserHasPermission(claims.sub, AUTH_RBAC_MANAGE_PERMISSION);
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const users = await auth.listUsers(claims.sub);
  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
    })),
  });
}

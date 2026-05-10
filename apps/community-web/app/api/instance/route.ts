import { NextRequest, NextResponse } from "next/server";
import { AUTH_RBAC_MANAGE_PERMISSION } from "@cs2helper/auth";
import { CommunityDomainError } from "@cs2helper/community-core";
import { getClaimsFromRequest } from "@/lib/api-auth";
import { getAuthService } from "@/lib/auth/service";
import { getCommunityCoreSdk } from "@/lib/community/service";
import { loadConfig } from "@/lib/config";
import { getClientIp } from "@/lib/proxy";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const displayName = await getCommunityCoreSdk().getInstanceDisplayName();
  return NextResponse.json({ displayName });
}

export async function PATCH(request: NextRequest) {
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

  let body: { displayName?: string };
  try {
    body = (await request.json()) as { displayName?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const displayName = body.displayName;
  if (typeof displayName !== "string") {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    await getCommunityCoreSdk().setInstanceDisplayName(displayName);
  } catch (e) {
    if (e instanceof CommunityDomainError) {
      return NextResponse.json({ error: e.code }, { status: 400 });
    }
    throw e;
  }
  return NextResponse.json({ ok: true });
}

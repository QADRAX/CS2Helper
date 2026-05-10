import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_INVITATIONS_MANAGE_PERMISSION,
} from "@cs2helper/auth";
import { getClaimsFromRequest } from "@/lib/api-auth";
import { getAuthService } from "@/lib/auth/service";
import { loadConfig } from "@/lib/config";
import { getClientIp } from "@/lib/proxy";
import { rateLimit } from "@/lib/rate-limit";

async function requireAdmin(request: NextRequest) {
  const claims = await getClaimsFromRequest(request);
  if (!claims) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const cfg = loadConfig();
  const ip = getClientIp(request);
  if (!rateLimit(`admin:${claims.sub}:${ip}`, cfg.rateLimitAdminPerMinute, 60_000)) {
    return { error: NextResponse.json({ error: "rate_limited" }, { status: 429 }) };
  }
  return { claims };
}

export async function GET(request: NextRequest) {
  const r = await requireAdmin(request);
  if ("error" in r) return r.error;
  const auth = getAuthService();
  try {
    await auth.assertUserHasPermission(r.claims.sub, AUTH_INVITATIONS_MANAGE_PERMISSION);
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const rows = await auth.listInvitations(r.claims.sub);
  return NextResponse.json({
    invitations: rows.map((i) => ({
      ...i,
      expiresAt: i.expiresAt.toISOString(),
      revokedAt: i.revokedAt?.toISOString() ?? null,
      createdAt: i.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest) {
  const r = await requireAdmin(request);
  if ("error" in r) return r.error;
  const auth = getAuthService();
  try {
    await auth.assertUserHasPermission(r.claims.sub, AUTH_INVITATIONS_MANAGE_PERMISSION);
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: { ttlSec?: number; maxUses?: number; extraRoleName?: string | null };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const ttlSec = Number(body.ttlSec ?? 86400);
  const maxUses = Number(body.maxUses ?? 1);
  if (!Number.isFinite(ttlSec) || ttlSec < 60 || !Number.isFinite(maxUses) || maxUses < 1) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const created = await auth.createInvitation(r.claims.sub, {
    ttlSec,
    maxUses,
    extraRoleName: body.extraRoleName ?? null,
  });
  return NextResponse.json({
    invitationId: created.invitationId,
    plainCode: created.plainCode,
    expiresAt: created.expiresAt.toISOString(),
  });
}

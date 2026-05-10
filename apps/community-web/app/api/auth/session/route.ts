import { NextRequest, NextResponse } from "next/server";
import { getClaimsFromRequest } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const claims = await getClaimsFromRequest(request);
  if (!claims) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    sub: claims.sub,
    email: claims.email,
    permissions: claims.permissions,
    roles: claims.roles,
  });
}

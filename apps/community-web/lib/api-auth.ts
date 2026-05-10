import type { NextRequest } from "next/server";
import type { AccessTokenClaims } from "@cs2helper/auth";
import { COOKIE_ACCESS } from "@/lib/auth/cookies";
import { getAuthService } from "@/lib/auth/service";

export async function getClaimsFromRequest(
  request: NextRequest
): Promise<AccessTokenClaims | null> {
  const access = request.cookies.get(COOKIE_ACCESS)?.value;
  if (!access) return null;
  try {
    return await getAuthService().verifyAccessToken(access);
  } catch {
    return null;
  }
}

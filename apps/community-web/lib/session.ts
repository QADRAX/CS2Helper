import { cookies } from "next/headers";
import type { AccessTokenClaims } from "@cs2helper/auth";
import { COOKIE_ACCESS } from "./auth/cookies";
import { getAuthService } from "./auth/service";

export async function getSessionFromCookies(): Promise<AccessTokenClaims | null> {
  const jar = await cookies();
  const access = jar.get(COOKIE_ACCESS)?.value;
  if (!access) return null;
  try {
    return await getAuthService().verifyAccessToken(access);
  } catch {
    return null;
  }
}

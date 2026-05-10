import type { SessionPolicyPort } from "../../ports";

export function createSessionPolicyFake(
  overrides: Partial<SessionPolicyPort> = {}
): SessionPolicyPort {
  return {
    accessTokenTtlSec: 300,
    refreshTokenTtlSec: 60 * 60 * 24 * 14,
    defaultRegistrationRoleName: "member",
    requireInvitationForRegister: false,
    ...overrides,
  };
}

export interface SessionPolicyPort {
  readonly accessTokenTtlSec: number;
  readonly refreshTokenTtlSec: number;
  readonly defaultRegistrationRoleName: string;
  /** When true, new accounts must supply a valid invitation (Steam sign-in). */
  readonly requireInvitationForRegister: boolean;
}

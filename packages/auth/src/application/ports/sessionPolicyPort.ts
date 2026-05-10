export interface SessionPolicyPort {
  readonly accessTokenTtlSec: number;
  readonly refreshTokenTtlSec: number;
  readonly defaultRegistrationRoleName: string;
  /** When true, {@link RegisterUserInput.invitationPlainCode} is required. */
  readonly requireInvitationForRegister: boolean;
}

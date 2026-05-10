export interface SessionPolicyPort {
  readonly accessTokenTtlSec: number;
  readonly refreshTokenTtlSec: number;
  readonly defaultRegistrationRoleName: string;
}

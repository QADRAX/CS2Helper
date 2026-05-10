export type RegisterUserInput = {
  email: string;
  password: string;
  /**
   * When session policy sets `requireInvitationForRegister`, this is required.
   * Otherwise optional; if provided, must be valid and is consumed on successful signup.
   */
  invitationPlainCode?: string;
};

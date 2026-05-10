export class Cs2ClientListenerAlreadyRunningError extends Error {
  constructor() {
    super("Cs2ClientListener is already running");
    this.name = "Cs2ClientListenerAlreadyRunningError";
  }
}

export class Cs2ClientListenerNotRunningError extends Error {
  constructor() {
    super("Cs2ClientListener is not running; call start() first");
    this.name = "Cs2ClientListenerNotRunningError";
  }
}

/**
 * Optional knobs exposed by the launcher port.
 */
export interface Cs2LaunchOptions {
  /** Extra command-line args forwarded to CS2 (e.g. ["-novid", "-console"]). */
  args?: readonly string[];
}

/**
 * Application-layer abstraction for launching CS2 through Steam.
 * Implementations decide which transport to use (steam:// URL,
 * `steam.exe -applaunch`, etc.).
 *
 * The contract intentionally does not wait for the game to be ready —
 * presence/readiness must be observed separately via `Cs2ProcessPort`.
 */
export interface Cs2LauncherPort {
  /** Fires the launch request and resolves once Steam has been invoked. */
  launch: (options?: Cs2LaunchOptions) => Promise<void>;
}

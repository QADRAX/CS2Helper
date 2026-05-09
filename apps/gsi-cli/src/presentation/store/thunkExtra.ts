import type { CliApp } from "../../application/CliApp";

/** Injected into every thunk via `configureStore` middleware (`extraArgument`). */
export interface CliThunkExtra {
  cliApp: CliApp;
}

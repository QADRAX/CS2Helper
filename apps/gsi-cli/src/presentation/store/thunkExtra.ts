import type { CliApp } from "../../infrastructure/cli/CliAppService";

/** Injected into every thunk via `configureStore` middleware (`extraArgument`). */
export interface CliThunkExtra {
  cliApp: CliApp;
}

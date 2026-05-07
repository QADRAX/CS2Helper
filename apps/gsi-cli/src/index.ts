import React from "react";
import { render } from "ink";
import { CliAppService } from "./infrastructure/cli/CliAppService.js";
import { App } from "./presentation/App.js";

/**
 * ANSI sequence that mirrors a `cls`:
 *   - `\x1B[2J` clears the visible viewport
 *   - `\x1B[3J` clears the scrollback (xterm extension, supported by modern
 *               terminals incl. Windows Terminal / VS Code integrated term)
 *   - `\x1B[H`  parks the cursor at the home position (0,0)
 */
const CLEAR_TERMINAL = "\x1B[2J\x1B[3J\x1B[H";

function main() {
  const cliApp = new CliAppService();
  const element = React.createElement(App, { cliApp });

  process.stdout.write(CLEAR_TERMINAL);

  const instance = render(element);

  /**
   * On resize, Ink's internal `log-update` line tracker is no longer aligned
   * with the rewrapped layout, leaving "ghost" lines behind the new frame.
   *
   * Wiping the screen + scrollback and resetting the line tracker via
   * `instance.clear()` guarantees the next React commit paints onto a clean
   * canvas. Ink's own resize handler (registered first by `render`) will
   * schedule the re-render right after, so we don't need to call `rerender`
   * manually here.
   */
  const handleResize = (): void => {
    process.stdout.write(CLEAR_TERMINAL);
    instance.clear();
  };
  process.stdout.on("resize", handleResize);

  const teardown = async (): Promise<void> => {
    process.stdout.off("resize", handleResize);
    instance.clear();
    await cliApp.stopGateway();
    process.exit(0);
  };

  process.on("SIGINT", teardown);
  process.on("SIGTERM", teardown);
}

main();

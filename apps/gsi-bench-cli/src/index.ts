import React from "react";
import { render } from "ink";
import { BenchCliApplication } from "./infrastructure/BenchCliApplication.js";
import { App } from "./presentation/App.js";

const CLEAR_TERMINAL = "\x1B[2J\x1B[3J\x1B[H";

function main() {
  const benchApp = new BenchCliApplication();
  const element = React.createElement(App, { benchApp });

  process.stdout.write(CLEAR_TERMINAL);

  const instance = render(element);

  const handleResize = (): void => {
    process.stdout.write(CLEAR_TERMINAL);
    instance.clear();
  };
  process.stdout.on("resize", handleResize);

  const teardown = (): void => {
    process.stdout.off("resize", handleResize);
    instance.clear();
    process.exit(0);
  };

  process.on("SIGINT", teardown);
  process.on("SIGTERM", teardown);
}

main();

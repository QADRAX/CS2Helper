import React from 'react';
import { render } from 'ink';
import { CliAppService } from './infrastructure/cli/CliAppService.js';
import { App } from './presentation/App.js';

function main() {
  const cliApp = new CliAppService();

  const { clear } = render(React.createElement(App, { cliApp }));

  // handle process exit
  process.on('SIGINT', async () => {
    clear();
    await cliApp.stopGateway();
    process.exit(0);
  });
}

main();

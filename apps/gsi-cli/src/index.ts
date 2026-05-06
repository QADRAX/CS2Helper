import React from 'react';
import { render } from 'ink';
import { CliAppService } from './infrastructure/cli/CliAppService.js';
import { RootApp } from './presentation/cli/RootApp.js';

function main() {
  const cliApp = new CliAppService();

  const { clear } = render(React.createElement(RootApp, { cliApp }));

  // handle process exit
  process.on('SIGINT', async () => {
    clear();
    await cliApp.stopGateway();
    process.exit(0);
  });
}

main();

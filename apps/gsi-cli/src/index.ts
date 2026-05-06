import React from 'react';
import { render } from 'ink';
import { createCliAppService } from './infrastructure/cli/createCliAppService.js';
import { App } from './presentation/cli/App.js';

function main() {
  const cliApp = createCliAppService();

  const { clear } = render(React.createElement(App, { cliApp }));

  // handle process exit
  process.on('SIGINT', async () => {
    clear();
    await cliApp.stopGateway();
    process.exit(0);
  });
}

main();

/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { app } from 'electron';
import { createWindow } from './MainWindow';
import { createGameStateListener } from '../GSI/GameStateListener';
import { gameState } from '../GSI/state/gameState';
import { matchDataProcessor } from '../GSI/MatchDataProcessor';

/*
ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});
*/

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const csgoListener = createGameStateListener();
const unsubscribeMatchProcessor = gameState.subscribe(matchDataProcessor);

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
    unsubscribeMatchProcessor();
    csgoListener.close();
  }
});

app
  .whenReady()
  .then(async () => {
    csgoListener.listen();
    let mainWindow = await createWindow();
    app.on('activate', async () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) mainWindow = await createWindow();
    });
  })
  .catch(console.log);

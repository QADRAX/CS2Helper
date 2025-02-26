import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

export function initializeAutoUpdater() {
  log.transports.file.level = 'info';
  autoUpdater.logger = log;
  autoUpdater.checkForUpdatesAndNotify();
}

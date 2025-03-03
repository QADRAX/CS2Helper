import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { MatchData } from '../types/CSState';
import { GameState } from '../types/CSGO';

export interface IpcChannels {
  'game-state': [state: GameState];
  'match-state': [state: MatchData];
}

export type Channels = keyof IpcChannels;

const electronHandler = {
  ipcRenderer: {
    sendMessage<K extends Channels>(channel: K, ...args: IpcChannels[K]) {
      ipcRenderer.send(channel, ...args);
    },
    on<K extends Channels>(
      channel: K,
      listener: (...args: IpcChannels[K]) => void
    ) {
      const subscription = (_event: IpcRendererEvent, ...args: any[]) => {
        listener(...(args as IpcChannels[K]));
      };
      ipcRenderer.on(channel, subscription);
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once<K extends Channels>(
      channel: K,
      listener: (...args: IpcChannels[K]) => void
    ) {
      ipcRenderer.once(channel, (_event, ...args: any[]) => {
        listener(...(args as IpcChannels[K]));
      });
    },
    removeAllListeners(channel: Channels) {
      ipcRenderer.removeAllListeners(channel);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;

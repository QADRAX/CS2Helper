import { useEffect, useState } from 'react';
import { Channels, IpcChannels } from '../../main/preload';

export function useBackendData<K extends Channels>(
  channelName: K,
): IpcChannels[K][0] | null {
  const [backendData, setBackendData] = useState<IpcChannels[K][0] | null>(
    null,
  );

  useEffect(() => {
    window.electron.ipcRenderer.on(channelName, (data) => {
      setBackendData(data);
    });

    return () => {
      window.electron.ipcRenderer.removeAllListeners(channelName);
    };
  }, [channelName]);

  return backendData;
}

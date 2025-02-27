import React, { useEffect, useState } from 'react';
import { CSState } from '../../types/CSState';
import GameStateViewer from './GameStateViewer';

const GameState: React.FC = () => {
  const [gameState, setGameState] = useState<CSState | null>(null);

  useEffect(() => {
    // Escuchar actualizaciones de estado del juego desde Electron
    window.electron.ipcRenderer.on('game-state', (state) => {
      setGameState(state as CSState | null);
    });

    return () => {
      window.electron.ipcRenderer.removeAllListeners('game-state');
    };
  }, []);

  if (!gameState) return <div>Waiting for CS:GO...</div>;

  return (
    <div>
      <GameStateViewer gameState={gameState} />
    </div>
  );
};

export default GameState;

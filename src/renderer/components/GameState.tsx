import React from 'react';
import GameStateViewer from './GameStateViewer';
import { useBackendData } from '../hooks/useBackendData';

const GameState: React.FC = () => {
  const gameState = useBackendData('game-state');

  if (!gameState) return <div>Waiting for CS:GO...</div>;

  return (
    <div>
      <GameStateViewer gameState={gameState} />
    </div>
  );
};

export default GameState;

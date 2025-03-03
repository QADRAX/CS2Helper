import React from 'react';
import GameStateViewer from './GameStateViewer';
import { useAppContext } from '../hooks/useAppContext';
import MatchDataComponent from './MatchDataComponent';

const GameState: React.FC = () => {
  const { gameState, matchData } = useAppContext();

  if (!gameState) return <div>Waiting for CS:GO...</div>;

  return (
    <div>
      <GameStateViewer gameState={gameState} />
      {matchData && <MatchDataComponent matchData={matchData} />}
    </div>
  );
};

export default GameState;

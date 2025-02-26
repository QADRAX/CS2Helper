import React from 'react';
import { GameStateMenu } from '../../types/CSGO';

interface Props {
  state: GameStateMenu;
}

const GameMenu: React.FC<Props> = ({ state }) => {
  return (
    <div className="game-menu">
      <h2>🚀 CS:GO Menu</h2>
      <p>Player: {state.player.name}</p>
      <p>Status: {state.player.activity}</p>
    </div>
  );
};

export default GameMenu;

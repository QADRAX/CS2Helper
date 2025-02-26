import React from 'react';
import { GameState } from '../../types/CSGO';
import PlayerInfo from './PlayerInfo';
import RoundInfo from './RoundInfo';

interface Props {
  state: GameState;
}

const GamePlaying: React.FC<Props> = ({ state }) => {
  return (
    <div className="game-playing">
      <h2>🎮 CS:GO Match</h2>
      <p>🗺️ Map: {state.map?.name} ({state.map?.mode})</p>
      <RoundInfo round={state.round} />
      <PlayerInfo playerState={state.player?.state} />
    </div>
  );
};

export default GamePlaying;

import React from 'react';
import { PlayerState } from '../../types/CSGO';

interface Props {
  playerState?: PlayerState;
}

const PlayerInfo: React.FC<Props> = ({ playerState }) => {
  return (
    <div className="player-info">
      <p>💰 Money: ${playerState?.money}</p>
      <p>❤️ Health: {playerState?.health}</p>
      <p>🔫 Equipment Value: ${playerState?.equip_value}</p>
    </div>
  );
};

export default PlayerInfo;

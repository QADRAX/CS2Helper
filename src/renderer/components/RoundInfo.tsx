import React from 'react';
import { Round } from '../../types/CSGO';

interface Props {
  round?: Round;
}

const RoundInfo: React.FC<Props> = ({ round }) => {
  return (
    <div className="round-info">
      <h3>🏆 Round Info</h3>
      <p>Phase: {round?.phase}</p>
      {round?.win_team && <p>🎉 Winner: {round?.win_team}</p>}
    </div>
  );
};

export default RoundInfo;

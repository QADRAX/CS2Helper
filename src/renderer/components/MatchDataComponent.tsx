import React from 'react';
import { MatchData } from '../../types/CSState';

// Asumimos que ya tienes definidas las interfaces MatchData, RoundData, etc.

interface MatchDataProps {
  matchData: MatchData;
}

const MatchDataComponent: React.FC<MatchDataProps> = ({ matchData }) => {
  return (
    <div className="match-data">
      <header>
        <h1>Match en {matchData.mapName}</h1>
        <p>Modo: {matchData.mode}</p>
        <p>
          Fecha: {new Date(matchData.timestamp).toLocaleDateString()}{' '}
          {new Date(matchData.timestamp).toLocaleTimeString()}
        </p>
      </header>

      <section className="rounds">
        {matchData.rounds.map((round) => (
          <div key={round.roundNumber} className="round">
            <h2>Ronda {round.roundNumber}</h2>
            <p>
              Inicio: {new Date(round.timestamp).toLocaleTimeString()}
            </p>
            {round.roundOverTimestamp && (
              <p>
                Fin: {new Date(round.roundOverTimestamp).toLocaleTimeString()}
              </p>
            )}

            <div className="kills">
              <h3>Kills</h3>
              {round.kills.length > 0 ? (
                <ul>
                  {round.kills.map((kill) => (
                    <li key={kill.timestamp}>
                      <strong>{new Date(kill.timestamp).toLocaleTimeString()}</strong> - Arma: {kill.weapon} - Flashed: {kill.flashed} - Smoked: {kill.smoked}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hubo kills en esta ronda.</p>
              )}
            </div>

            <div className="deaths">
              <h3>Muertes</h3>
              {round.deaths.length > 0 ? (
                <ul>
                  {round.deaths.map((death) => (
                    <li key={death.timestamp}>
                      <strong>{new Date(death.timestamp).toLocaleTimeString()}</strong> - Arma equipada: {death.equippedWeapon} - Flashed: {death.flashed} - Smoked: {death.smoked}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hubo muertes en esta ronda.</p>
              )}
            </div>

            <div className="damage-received">
              <h3>Daño Recibido</h3>
              {round.damageReceived.length > 0 ? (
                <ul>
                  {round.damageReceived.map((damage) => (
                    <li key={damage.timestamp}>
                      <strong>{new Date(damage.timestamp).toLocaleTimeString()}</strong> - Arma: {damage.equippedWeapon} - Daño: {damage.damage} - Flashed: {damage.flashed} - Smoked: {damage.smoked}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No se registró daño recibido en esta ronda.</p>
              )}
            </div>

            <div className="weapon-transactions">
              <h3>Transacciones de Armas</h3>
              {round.weaponTransactions.length > 0 ? (
                <ul>
                  {round.weaponTransactions.map((transaction) => (
                    <li key={transaction.timestamp}>
                      <strong>{new Date(transaction.timestamp).toLocaleTimeString()}</strong> - {transaction.transactionType === 'purchase' ? 'Compra' : 'Venta'} de {transaction.weaponName} por ${transaction.cost}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No se registraron transacciones en esta ronda.</p>
              )}
            </div>

            <div className="teams">
              <p>
                Equipo del jugador: <strong>{round.playerTeam}</strong>
              </p>
              {round.winnerTeam && (
                <p>
                  Equipo ganador: <strong>{round.winnerTeam}</strong>
                </p>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default MatchDataComponent;

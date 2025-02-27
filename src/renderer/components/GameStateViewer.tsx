import React from "react";
import "./GameStateViewer.css";
import { GameState, Map, Player, PlayerState, Provider, Round, Weapon, Weapons } from "../../types/CSGO";
interface GameStateProps {
  gameState: GameState;
}

const GameStateViewer: React.FC<GameStateProps> = ({ gameState }) => {
  return (
    <div className="game-state-container">
      <h1>CS:GO Game State</h1>
      <ProviderInfo provider={gameState.provider} />
      {gameState.map && <MapInfo map={gameState.map} />}
      {gameState.round && <RoundInfo round={gameState.round} />}
      {gameState.player && <PlayerInfo player={gameState.player} />}
    </div>
  );
};

// 🎯 Información del proveedor (Steam)
const ProviderInfo: React.FC<{ provider: Provider }> = ({ provider }) => (
  <table className="info-table">
    <thead>
      <tr>
        <th>Provider</th>
        <th>Version</th>
        <th>Steam ID</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{provider.name}</td>
        <td>{provider.version}</td>
        <td>{provider.steamid}</td>
      </tr>
    </tbody>
  </table>
);

// 🗺️ Información del mapa
const MapInfo: React.FC<{ map: Map }> = ({ map }) => (
  <table className="info-table">
    <thead>
      <tr>
        <th>Map</th>
        <th>Mode</th>
        <th>Phase</th>
        <th>Round</th>
        <th>CT Score</th>
        <th>T Score</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{map.name}</td>
        <td>{map.mode}</td>
        <td>{map.phase}</td>
        <td>{map.round}</td>
        <td>{map.team_ct.score}</td>
        <td>{map.team_t.score}</td>
      </tr>
    </tbody>
  </table>
);

// 🔥 Estado de la ronda
const RoundInfo: React.FC<{ round: Round }> = ({ round }) => (
  <table className="info-table">
    <thead>
      <tr>
        <th>Phase</th>
        <th>Bomb</th>
        <th>Winning Team</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{round.phase}</td>
        <td>{round.bomb || "N/A"}</td>
        <td>{round.win_team || "N/A"}</td>
      </tr>
    </tbody>
  </table>
);

// 🎭 Información del jugador
const PlayerInfo: React.FC<{ player: Player }> = ({ player }) => (
  <div>
    <h1>{player.name} ({player.team})</h1>
    <PlayerStateInfo state={player.state} />
    {player.weapons && <WeaponsInfo weapons={player.weapons} />}
  </div>
);

// 🏋️ Estado del jugador (ahora en su propio componente)
const PlayerStateInfo: React.FC<{ state: PlayerState }> = ({ state }) => (
  <table className="info-table">
    <thead>
      <tr>
        <th>Health</th>
        <th>Armor</th>
        <th>Helmet</th>
        <th>Money</th>
        <th>Equip Value</th>
        <th>Flashed</th>
        <th>Smoked</th>
        <th>Burning</th>
        <th>Defuse Kit</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{state.health}</td>
        <td>{state.armor}</td>
        <td>{state.helmet ? "✅" : "❌"}</td>
        <td>${state.money}</td>
        <td>${state.equip_value}</td>
        <td>{state.flashed}</td>
        <td>{state.smoked}</td>
        <td>{state.burning}</td>
        <td>{state.defusekit ? "✅" : "❌"}</td>
      </tr>
    </tbody>
  </table>
);

// 🔫 Armas del jugador en tabla
const WeaponsInfo: React.FC<{ weapons: Weapons }> = ({ weapons }) => (
  <table className="info-table">
    <thead>
      <tr>
        <th>Slot</th>
        <th>Type</th>
        <th>Name</th>
        <th>Paintkit</th>
        <th>State</th>
        <th>Ammo</th>
      </tr>
    </thead>
    <tbody>
      {Object.entries(weapons).map(([slot, weapon]) => (
        <WeaponItem key={slot} slot={slot} weapon={weapon} />
      ))}
    </tbody>
  </table>
);

// 🔫 Renderizar un arma
const WeaponItem: React.FC<{ slot: string; weapon: Weapon }> = ({ slot, weapon }) => (
  <tr>
    <td>{slot}</td>
    <td>{weapon.type}</td>
    <td>{weapon.name}</td>
    <td>{weapon.paintkit}</td>
    <td>{weapon.state}</td>
    <td>
      {"ammo_clip" in weapon
        ? `${weapon.ammo_clip}/${weapon.ammo_clip_max} (Reserve: ${weapon.ammo_reserve})`
        : "N/A"}
    </td>
  </tr>
);

export default GameStateViewer;

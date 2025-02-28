import { CSState, MatchData } from "../../types/CSState";
import { getEquippedWeapon } from "../../utils/getEquipedWeapon";
import { Observer } from "../Observer";

// 📌 Estado global para partidas
let currentMatch: MatchData | null = null;
let lastKills = 0;
let lastDeaths = 0;
let playerSteamId: string | null = null;
let currentRound = 0;
let lastMapPhase: string | null = null;
let lastRoundPhase: string | null = null;

/**
 * Genera un ID único basado en el mapa.
 */
const generateMatchId = (mapName: string): string => {
  return `${mapName}-${Date.now()}`;
};

/**
 * Procesa el estado del juego para registrar datos de partidas, rondas y eventos.
 */
export const matchDataProcessor: Observer<CSState> = (gameState) => {
  if (!gameState || !gameState.player || !gameState.provider || !gameState.map)
    return;

  const currentSteamId = gameState.player.steamid;
  const providerSteamId = gameState.provider.steamid; // Detectar si estamos en deathcam
  const playerHealth = gameState.player.state?.health ?? 100;
  const currentKills = gameState.player.match_stats?.kills ?? 0;
  const currentDeaths = gameState.player.match_stats?.deaths ?? 0;
  const equippedWeapon = getEquippedWeapon(gameState.player.weapons);
  const gameTimestamp = gameState.provider.timestamp * 1000; // Convertimos a ms
  const roundPhase = gameState.round?.phase ?? "over"; // Estado actual de la ronda
  const mapPhase = gameState.map.phase; // Fase actual del mapa
  const mapName = gameState.map.name;
  const gameRound = gameState.map.round;

  // 📌 1️⃣ Detectar el inicio de una nueva partida (fase pasa a warmup)
  if (!currentMatch || (mapPhase === "warmup" && lastMapPhase !== "warmup")) {
    currentMatch = { matchId: generateMatchId(mapName), rounds: [] };
    console.log(`🆕 New match detected: ${currentMatch.matchId}`);

    // Resetear estado de la partida
    lastKills = 0;
    lastDeaths = 0;
    currentRound = 0;
  }

  // 📌 2️⃣ Detectar el fin de una partida (fase pasa a gameover)
  if (mapPhase === "gameover" && lastMapPhase !== "gameover") {
    if (currentMatch) {
      console.log(`🏁 Match ended: ${currentMatch.matchId}`);
      saveMatchData(currentMatch); // Guardar los datos antes de resetear
    }
    currentMatch = null;
    lastMapPhase = null;
    return;
  }

  lastMapPhase = mapPhase; // Guardamos la última fase del mapa

  // 📌 3️⃣ Detectar el inicio de una nueva ronda (fase pasa a freezetime)
  if (roundPhase === "freezetime" && lastRoundPhase !== "freezetime") {
    if (!currentMatch.rounds.some((r) => r.roundNumber === gameRound)) {
      console.log(`🔄 New round detected: ${gameRound}`);
      currentMatch.rounds.push({ roundNumber: gameRound, kills: [], deaths: [] });
      currentRound = gameRound;
      lastKills = 0;
      lastDeaths = 0;
    }
  }

  // 📌 4️⃣ Detectar el fin de una ronda (fase pasa de live a over)
  if (lastRoundPhase === "live" && roundPhase === "over") {
    console.log(`🔚 Round ${gameRound} ended`);
  }

  lastRoundPhase = roundPhase; // Guardamos la última fase de la ronda

  // 📌 5️⃣ Evitar contaminación de datos si el jugador está en deathcam
  if (providerSteamId !== currentSteamId && playerHealth > 0) {
    console.log("🚫 Ignoring game state update due to spectating another player (deathcam detected).");
    return;
  }

  if (playerHealth === 0) {
    if (!playerSteamId) {
      playerSteamId = currentSteamId;
    }
  } else {
    playerSteamId = null;
  }

  // 📌 6️⃣ Registrar kills en la ronda actual
  if (currentKills > lastKills) {
    let weaponUsed = equippedWeapon;

    // 📌 Guardar en la ronda actual
    const roundData = currentMatch.rounds.find((r) => r.roundNumber === gameRound);
    if (roundData) {
      roundData.kills.push({ weapon: weaponUsed, timestamp: gameTimestamp });
    }

    console.log(`💀 Kill detected in round ${gameRound} with: ${weaponUsed}`);
  }

  // 📌 7️⃣ Registrar muertes en la ronda actual
  if (currentDeaths > lastDeaths) {
    const roundData = currentMatch.rounds.find((r) => r.roundNumber === gameRound);
    if (roundData) {
      roundData.deaths.push({ timestamp: gameTimestamp, roundPhase });
    }

    console.log(`☠️ Player died in round ${gameRound} during phase: ${roundPhase}`);
  }

  // 📌 Actualizar estado de memoria
  lastKills = currentKills;
  lastDeaths = currentDeaths;
};

/**
 * Guarda los datos de la partida en un archivo JSON o una base de datos.
 */
const saveMatchData = (match: MatchData) => {
  console.log(`📂 Saving match data: ${match.matchId}`);
  console.log(JSON.stringify(match, null, 2));
  // Aquí podrías guardar en un archivo o base de datos si lo necesitas.
};

/**
 * Devuelve el historial de la partida actual.
 */
export const getCurrentMatchData = (): MatchData | null => {
  return currentMatch;
};

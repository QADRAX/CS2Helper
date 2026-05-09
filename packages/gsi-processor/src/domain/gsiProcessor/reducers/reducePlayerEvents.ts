import { findRound } from "./helpers";
import type { PhaseRound } from "../../csgo/phases";
import type { PlayerMemoryState } from "../gsiProcessorTypes";
import type { ReducerContext } from "./reducerTypes";

/**
 * Precomputed frame shared by the per-player helper reducers for one tick.
 *
 * It bundles the current normalized player projection with the previous rolling
 * memory so helpers can stay focused on one tactical concern each.
 */
interface PlayerReducerFrame {
  player: ReducerContext["snapshot"]["players"][number];
  previous: PlayerMemoryState;
  gameRound: number;
  eventRound: number;
  roundPhase: PhaseRound;
}

/** Enforces the conservative execution policy for inferred player events. */
function canReducePlayerEvents(ctx: ReducerContext): boolean {
  if (!ctx.criticalReducersEnabled) {
    ctx.skipReason = "stream_not_healthy";
    return false;
  }

  return !!ctx.state.currentMatch && !!ctx.snapshot.map && !!ctx.snapshot.round;
}

/**
 * For `client_local`, kill/death/damage/economy/flash inference must only run
 * for `provider.steamid` when present. After death, GSI often swaps `player`
 * to a spectated teammate — we still mirror them in `reducePlayersState`,
 * but those HUD rows must not emit events tied to your personal match timeline.
 */
function shouldEmitInferredEventsForSteamId(ctx: ReducerContext, steamid: string): boolean {
  if (ctx.snapshot.watcherMode !== "client_local") {
    return true;
  }
  const local = ctx.snapshot.provider.steamid;
  if (!local) {
    return true;
  }
  return steamid === local;
}

/**
 * Builds the baseline memory used on the first observation of a player.
 *
 * The first tick should never emit retroactive events, so the baseline starts
 * at the currently observed counters instead of assuming zeros for kills/deaths.
 */
function createPreviousPlayerMemory(frame: PlayerReducerFrame["player"]): PlayerMemoryState {
  return {
    health: frame.health,
    kills: frame.kills,
    deaths: frame.deaths,
    flashed: 0,
    money: frame.money,
    weapons: frame.weapons,
    flashStartTimestamp: null,
  };
}

/** Appends kill data to round history and emits the public `kill` event. */
function pushKillEvent(ctx: ReducerContext, frame: PlayerReducerFrame): void {
  const { state, timestamp, events } = ctx;
  if (!state.currentMatch) return;

  const round = findRound(state.currentMatch, frame.eventRound);
  if (round) {
    round.kills.push({
      timestamp,
      roundPhase: frame.roundPhase,
      weapon: frame.player.equippedWeapon,
      flashed: frame.player.flashed,
      smoked: frame.player.smoked,
    });
  }

  events.push({
    type: "kill",
    steamid: frame.player.steamid,
    timestamp,
    roundNumber: frame.eventRound,
    roundPhase: frame.roundPhase,
    weapon: frame.player.equippedWeapon,
  });
}

/** Appends death data to round history and emits the public `death` event. */
function pushDeathEvent(ctx: ReducerContext, frame: PlayerReducerFrame): void {
  const { state, timestamp, events } = ctx;
  if (!state.currentMatch) return;

  const round = findRound(state.currentMatch, frame.eventRound);
  if (round) {
    round.deaths.push({
      timestamp,
      roundPhase: frame.roundPhase,
      equippedWeapon: frame.player.equippedWeapon,
      flashed: frame.player.flashed,
      smoked: frame.player.smoked,
    });
  }

  events.push({
    type: "death",
    steamid: frame.player.steamid,
    timestamp,
    roundNumber: frame.eventRound,
    roundPhase: frame.roundPhase,
    weapon: frame.player.equippedWeapon,
  });
}

/** Records incoming damage for the current gameplay round. */
function pushDamageEvent(ctx: ReducerContext, frame: PlayerReducerFrame, damage: number): void {
  const { state, timestamp, events } = ctx;
  if (!state.currentMatch) return;

  const currentRound = findRound(state.currentMatch, frame.gameRound);
  if (!currentRound) return;

  currentRound.damageReceived.push({
    timestamp,
    roundPhase: frame.roundPhase,
    damage,
    flashed: frame.player.flashed,
    smoked: frame.player.smoked,
    equippedWeapon: frame.player.equippedWeapon,
  });
  events.push({
    type: "damage_received",
    steamid: frame.player.steamid,
    timestamp,
    roundNumber: frame.gameRound,
    roundPhase: frame.roundPhase,
    damage,
    weapon: frame.player.equippedWeapon,
  });
}

/**
 * Tracks flash start/end using a timestamp kept in player rolling memory.
 *
 * A flash start is detected on the first positive intensity, and the duration is
 * emitted only when intensity returns to zero.
 */
function reduceFlashEvents(ctx: ReducerContext, frame: PlayerReducerFrame): void {
  const { state, timestamp, events } = ctx;
  if (!state.currentMatch) return;

  if (frame.player.flashed > 0 && frame.previous.flashed === 0) {
    frame.previous.flashStartTimestamp = timestamp;
    events.push({
      type: "flash_started",
      steamid: frame.player.steamid,
      timestamp,
      roundNumber: frame.eventRound,
    });
  }

  if (
    frame.player.flashed === 0 &&
    frame.previous.flashed > 0 &&
    frame.previous.flashStartTimestamp !== null
  ) {
    const duration = timestamp - frame.previous.flashStartTimestamp;
    const round = findRound(state.currentMatch, frame.eventRound);

    if (round) {
      round.flashes.push({
        timestamp: frame.previous.flashStartTimestamp,
        duration,
      });
    }

    events.push({
      type: "flash_ended",
      steamid: frame.player.steamid,
      timestamp,
      roundNumber: frame.eventRound,
      duration,
    });
    frame.previous.flashStartTimestamp = null;
  }
}

/** Writes one purchase/refund transaction to round history and to the event bus. */
function pushWeaponTransaction(
  ctx: ReducerContext,
  frame: PlayerReducerFrame,
  transactionType: "purchase" | "refund",
  weaponName: string,
  cost: number
): void {
  const currentRound = ctx.state.currentMatch && findRound(ctx.state.currentMatch, frame.gameRound);
  if (!currentRound) return;

  currentRound.weaponTransactions.push({
    timestamp: ctx.timestamp,
    roundPhase: frame.roundPhase,
    transactionType,
    weaponName,
    cost,
  });
  ctx.events.push({
    type: "weapon_transaction",
    steamid: frame.player.steamid,
    timestamp: ctx.timestamp,
    roundNumber: frame.gameRound,
    roundPhase: frame.roundPhase,
    transactionType,
    weaponName,
    cost,
  });
}

/**
 * Infers purchase/refund transactions from money deltas and inventory changes.
 *
 * Transactions are only meaningful inside the same gameplay round because a
 * round transition resets economy context and can otherwise look like a trade.
 */
function reduceWeaponTransactions(ctx: ReducerContext, frame: PlayerReducerFrame): void {
  if (frame.gameRound !== ctx.memory.lastGameRound || !ctx.state.currentMatch) return;

  const moneyDelta = frame.previous.money - frame.player.money;
  const purchased = frame.player.weapons.filter((weapon) => !frame.previous.weapons.includes(weapon));
  const sold = frame.previous.weapons.filter((weapon) => !frame.player.weapons.includes(weapon));

  if (purchased.length > 0 && moneyDelta > 0) {
    const cost = moneyDelta / purchased.length;
    for (const weaponName of purchased) {
      pushWeaponTransaction(ctx, frame, "purchase", weaponName, cost);
    }
  }

  if (sold.length > 0 && moneyDelta < 0) {
    const refund = (frame.player.money - frame.previous.money) / sold.length;
    for (const weaponName of sold) {
      pushWeaponTransaction(ctx, frame, "refund", weaponName, refund);
    }
  }
}

/** Persists the player projection back into rolling memory for the next tick. */
function persistPlayerMemory(ctx: ReducerContext, frame: PlayerReducerFrame): void {
  ctx.memory.players[frame.player.steamid] = {
    health: frame.player.health,
    kills: frame.player.kills,
    deaths: frame.player.deaths,
    flashed: frame.player.flashed,
    money: frame.player.money,
    weapons: frame.player.weapons,
    flashStartTimestamp: frame.previous.flashStartTimestamp,
  };
}

/**
 * Infers per-player tactical events from deltas between the current snapshot and
 * rolling player memory.
 *
 * This reducer is intentionally conservative: it only runs when critical
 * reducers are enabled and an active match exists, which prevents retroactive
 * event emission on cold starts, gaps or partial snapshots.
 */
export function reducePlayerEvents(ctx: ReducerContext): void {
  const { memory, snapshot } = ctx;
  if (!canReducePlayerEvents(ctx) || !snapshot.map || !snapshot.round) return;

  const gameRound = snapshot.map.round;
  const roundPhase = snapshot.round.phase;
  // When a round is already "over", new player deltas still belong to the last
  // completed gameplay round rather than the scoreboard's next round number.
  const eventRound = roundPhase === "over" ? memory.lastGameRound : gameRound;

  for (const player of snapshot.players) {
    const frame: PlayerReducerFrame = {
      player,
      previous: memory.players[player.steamid] ?? createPreviousPlayerMemory(player),
      gameRound,
      eventRound,
      roundPhase,
    };

    const emit = shouldEmitInferredEventsForSteamId(ctx, player.steamid);

    if (emit) {
      if (frame.player.kills > frame.previous.kills) pushKillEvent(ctx, frame);
      if (frame.player.deaths > frame.previous.deaths) pushDeathEvent(ctx, frame);

      const damage = frame.previous.health - frame.player.health;
      if (damage > 0) pushDamageEvent(ctx, frame, damage);

      reduceFlashEvents(ctx, frame);
      reduceWeaponTransactions(ctx, frame);
    }

    persistPlayerMemory(ctx, frame);
  }
}

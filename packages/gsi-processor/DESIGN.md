# Design — `@cs2helper/gsi-processor`

## Purpose

Expose an instance-based engine that ingests CS2 GSI ticks and builds an in-memory aggregate for the current match, while also emitting domain events.

## Public API

`@cs2helper/gsi-processor` exports:

- `createGsiProcessor(options?)`
- `GameState` (GSI input type)

Engine instance contract:

- `processTick(gameState, timestamp?)`
- `getState()`
- `subscribeState(listener)`
- `subscribeEvents(listener)`

## State model

The engine maintains:

- `currentMatch`: aggregated match data (`null` when idle)
- `lastGameState`: last non-null tick snapshot
- `totalTicks`: number of ingested ticks
- `lastProcessedAt`: last processing timestamp

## Event model

The engine emits domain-level events on transitions and player activity:

- match lifecycle (`match_started`, `match_ended`)
- round lifecycle (`round_started`, `round_live`, `round_over`, `round_winner`)
- player activity (`kill`, `death`, `damage_received`, `flash_started`, `flash_ended`, `weapon_transaction`)

## Non-goals

- IPC and Electron integration
- persistence/storage concerns
- network polling/transport (host app responsibility)

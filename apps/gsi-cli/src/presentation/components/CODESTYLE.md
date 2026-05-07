# Components Codestyle

## Goal

Build and evolve the CLI UI from a single layout root in `App.tsx` using explicit screen modes,
while keeping Redux store and presentation hooks as the source of truth.

## Architecture Rules

- `App.tsx` owns layout orchestration: persistent header + switchable body.
- Use a local screen state machine in `App.tsx` (menu/config/confirm screens).
- Keep side-effect wiring in `AppEffects` (`useConfigBootstrap`, sync hooks).
- Do not reintroduce `atoms` / `molecules` / `organisms` for this app.

## State Ownership

- Global application state comes from Redux selectors/thunks.
- Screen navigation state is local UI state in `App.tsx`.
- Config editing uses a local draft that is applied only on explicit save.

## Interaction Rules

- Header is always visible and shows Steam, CS2, and Gateway status.
- Body actions depend on gateway state:
  - Gateway idle: `start`, `config`, `exit`
  - Gateway online: `stop`, `exit`
- Config screen supports:
  - Up/down navigation between fields/actions
  - Save to persist and return to menu
  - Cancel/Escape to discard draft and return

## Guardrails

- Reuse existing store contracts (`startGateway`, `stopGateway`, `saveCliConfig`, `exitCli`).
- Avoid creating parallel command systems when menu flow already exists.
- Keep rendering simple and terminal-first (`ink`, clear focus/selection cues).

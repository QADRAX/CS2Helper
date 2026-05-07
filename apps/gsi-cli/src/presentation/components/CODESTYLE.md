# Components Codestyle

## Goal

Build and evolve the CLI UI with `App.tsx` as entry point, `CliShell` as base layout,
and a dedicated interactive organism for screen modes and keyboard flow.

## Architecture Rules

- `App.tsx` composes store + `RootReduxEffects` + `InteractiveCli`.
- `CliShell` is layout-only (header, optional gateway panel, primary panel slot, notifications).
- `InteractiveCli` owns the interactive screen state machine (menu/config/confirm), `useInput`, and the `cliSession` Redux slice; child screens consume selectors/actions for that slice.
- Keep side-effect wiring in `App.tsx` via `RootReduxEffects` (`useConfigBootstrap`, sync hooks).

## State Ownership

- Global application state comes from Redux selectors/thunks.
- Screen navigation indices and configuration draft live in the `cliSession` slice (`store/slices/cliSession`).
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

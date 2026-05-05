# Code Style — `@cs2helper/gsi-processor`

Adapted from the SpaceDucks core-v2 style guide. Applies to all code in this package.

## Files and structure

- **File names**: `camelCase.ts`
- **Max 200 lines** per `.ts` file; split into a subfolder with a barrel if it grows
- Each folder has an `index.ts` barrel re-exporting public symbols
- Barrels are only `index.ts` inside their own folder
- **Zero default exports** — use `export function`, `export interface`, `export type`, `export const` only when the value is truly constant and side-effect-free at load time; prefer `export function create…()` for composition roots
- **One file = one responsibility**

## Naming

| Thing | Convention | Example |
| ----- | ---------- | ------- |
| Files | `camelCase.ts` | `gameTypes.ts`, `weaponTypes.ts` |
| Types / interfaces | `PascalCase` | `GameState`, `MatchData` |
| Functions | `camelCase` | `getEquippedWeapon`, `createMatchDataProcessor` |
| Constants | `UPPER_SNAKE_CASE` | (rare in this package) |
| Factory functions | `create*` | `createStateContainer`, `createMatchDataProcessor` |

No `I` prefix on interfaces.

## Documentation

- **TSDoc** on every exported `interface`, `type`, and `function` in the public API surface (`src/index.ts` and domain utilities)
- Describe **what** and **why**, not obvious **how**

## Code rules

| Rule | Detail |
| ---- | ------ |
| No classes | Factories return typed objects; plain data and functions |
| No `this` in domain | Explicit parameters |
| No `any` | Use `unknown` + narrowing or generics |
| No side effects on import | Do not run factories at module top level; consumers call `create*()` explicitly |
| `import type` | For type-only imports |
| Immutability | Prefer `Readonly` at boundaries where it helps |

## Imports

- Relative within the same domain folder: `./phases`
- From sibling domain folders: `../state/createStateContainer`
- No deep imports from outside this package: use the package entry `index.js` / public exports

## Scope

This package is **agnostic of Electron and IPC**. Bridge types live in app packages.

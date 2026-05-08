# CS2Helper

Monorepo con `pnpm` workspaces y orquestación de tareas con Turborepo.

## Requisitos

- Node.js 20+
- Corepack habilitado (`corepack enable`)

## Instalación

```bash
corepack pnpm install
```

## Comandos principales

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm test:coverage
```

## Ejecución por paquete

```bash
pnpm --filter @cs2helper/gsi-cli build
pnpm --filter @cs2helper/gsi-bench-cli dev
```

## Notas

- El orden de build se resuelve topológicamente mediante Turborepo (`dependsOn: ["^build"]`).
- Las dependencias internas del monorepo usan `workspace:*`.
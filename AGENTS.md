# CS2Helper — guía para agentes (arquitectura)

Monorepo **pnpm** (`apps/*`, `packages/*`). Objetivo: **Clean Architecture** por capas, con casos de uso explícitos y puertos inyectados.

## Capas por paquete / app

Orden de dependencia permitido (**hacia dentro**): *presentation (solo apps con UI)* → *application* → *domain* ← *infrastructure*.

| Capa | Responsabilidad | No debe |
|------|-----------------|--------|
| **domain** | Tipos de dominio, reglas puras, reducers/máquinas de estado, funciones sin efectos laterales acoplados a frameworks | Importar desde `application`, `infrastructure`, SDKs de UI, Node “de proceso” salvo lo mínimo y justificado |
| **application** | Casos de uso (`UseCase` / `AsyncUseCase` de `@cs2helper/shared`), **ports** (interfaces), orquestación | Implementar detalles de IO; importar adapters concretos |
| **infrastructure** | Adapters que implementan ports, servicios de composición (`*Service`), HTTP, disco, reloj, etc. | Definir nuevas reglas de negocio que pertenezcan a domain |
| **presentation** (apps, p. ej. Ink/React) | UI, store, componentes; compone casos de uso vía puertos/adapters | Contener lógica de dominio sustitutiva de `domain/` |

Los **bordes del paquete** se exponen desde `src/index.ts` (o subpaths documentados). Evita que consumidores dependan de rutas internas (`**/useCases/**` directo) salvo convención explícita del paquete.

## Casos de uso y puertos

- Firma: `UseCase<TPorts, TArgs, TResult>` donde `TPorts` es preferiblemente una **tupla** de puertos en **orden fijado** y documentado en un comentario (*Ports tuple order: `[…]`*).
- El primer argumento del caso de uso es siempre `ports`; el resto son argumentos de negocio (`TArgs`).
- Los **ports** viven en `application/ports/` (interfaces). Las implementaciones viven en `infrastructure/adapters/` o clases servicio que cumplen el contrato.

## Nuevo package o feature

1. Aclarar **qué** es dominio vs orquestación vs IO.
2. Añadir tipos y funciones en **domain** primero si aplica.
3. Casos de uso en **application/useCases** + interfaces en **application/ports**.
4. **Infrastructure** solo cablea y adapta; tests de integración contra adapters reales o test doubles compartidos.
5. En **apps**, la capa de presentación solo consume la API pública de packages o puertos registrados en el composition root.

## Referencias en el repo

- `packages/shared` — tipos `UseCase` / `AsyncUseCase`.
- Ejemplos recientes: `packages/gsi-gateway`, `packages/gsi-processor`, `apps/gsi-cli` (use cases con tuplas de puertos).

Si una tarea cruza capas al revés, **propón refactor** o mover código antes de acoplar.

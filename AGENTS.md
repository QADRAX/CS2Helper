# CS2Helper — guía para agentes (arquitectura)

Monorepo **pnpm** (`apps/*`, `packages/*`). Objetivo: **Clean Architecture** por capas, con casos de uso explícitos y puertos inyectados.

## Layout bajo `src/`

En `packages/*/src` y `apps/*/src`, en la **raíz** solo deben aparecer carpetas de capa:

| Carpeta | Alias habitual |
|---------|----------------|
| `application/` | app |
| `infrastructure/` | infra |
| `domain/` | — |
| `presentation/` | — (solo apps con UI cuando aplique) |

No añadir otras raíces bajo `src/` (p. ej. `src/ports`, `src/utils`); el contenido va en la capa que corresponda (`application/ports`, `domain`, etc.).

## Capas por paquete / app

Orden de dependencia permitido (**hacia dentro**): *presentation (solo apps con UI)* → *application* → *domain* ← *infrastructure*.

| Capa | Responsabilidad | No debe |
|------|-----------------|--------|
| **domain** | Tipos de dominio, reglas puras, reducers/máquinas de estado, funciones sin efectos laterales acoplados a frameworks | Importar desde `application`, `infrastructure`, SDKs de UI, Node “de proceso” salvo lo mínimo y justificado |
| **application** | Casos de uso (`UseCase` / `AsyncUseCase` de `@cs2helper/shared`), **ports** (interfaces), orquestación | Implementar detalles de IO; importar adapters concretos |
| **infrastructure** | Adapters, IO, y **una clase `*Application` por app** que cablea casos de uso con `withPorts` / `withPortsAsync` (`@cs2helper/shared`) | Definir reglas de negocio que pertenezcan a `domain` |
| **presentation** (apps, p. ej. Ink/React) | UI, store, componentes; compone casos de uso vía puertos/adapters | Contener lógica de dominio sustitutiva de `domain/` |

Los **bordes del paquete** se exponen desde `src/index.ts` (o subpaths documentados). Evita que consumidores dependan de rutas internas (`**/useCases/**` directo) salvo convención explícita del paquete.

## Casos de uso y puertos

- Firma: `UseCase<TPorts, TArgs, TResult>` con **`TPorts` siempre una tupla** (`[]` si no hay puertos). Orden documentado (*Ports tuple order: `[…]`*).
- El primer argumento del caso de uso es siempre `ports`; el resto son argumentos de negocio (`TArgs`).
- Los **ports** viven en `application/ports/` (interfaces). Las implementaciones viven en `infrastructure/adapters/` o clases servicio que cumplen el contrato.

## Nuevo package o feature

1. Aclarar **qué** es dominio vs orquestación vs IO.
2. Añadir tipos y funciones en **domain** primero si aplica.
3. Casos de uso en **application/useCases** + interfaces en **application/ports**.
4. **Infrastructure** solo cablea y adapta; tests de integración contra adapters reales o test doubles compartidos.
5. En **apps**, la capa de presentación solo consume la API pública de packages o puertos registrados en el composition root.

## Paquetes SDK / composición (p. ej. `tick-hub`, `cs2-client-listener`)

- **Contrato público = interfaz de SDK** en **domain/** o **application/** (p. ej. `TickHub`, `Cs2ClientListenerSdk`) que la clase raíz de **infrastructure** **implementa** explícitamente (`class XService implements XSdk`), al estilo de `GsiGatewayService implements GsiGateway`.
- La API del SDK usa **tipos de dominio y opciones declarativas** (rutas de archivo, flags, DTOs). **No** expongas en esa interfaz tipos de **application/ports** (`*Port`) ni pidas al consumidor que inyecte adaptadores de grabación/IO salvo casos muy avanzados documentados aparte.
- **Puertos y casos de uso** (`UseCase`, tuplas de ports) son **detalle interno** para orquestar y testear; no mezcles su forma (`withPorts`, firmas de ports) con la superficie del SDK.
- **Adapters en infrastructure**: preferir **`class FooAdapter implements BarPort`** (como `GsiGatewayService`) antes que factories sueltas `createFooAdapter()` en la superficie exportada del paquete.
- Quien necesite **extender** el comportamiento no debe colgar “fuentes extra” en opciones del SDK salvo decisión explícita del diseño: en general **compón otro servicio** o **implementa el contrato** tú mismo reutilizando el paquete genérico (`tick-hub`) por debajo.

## Referencias en el repo

- `packages/shared` — tipos `UseCase` / `AsyncUseCase`, helpers `withPorts` / `withPortsAsync`, y ports transversales en `application/ports/`.
- Apps CLI: interfaz de aplicación (`CliApp`, `BenchCliApp`) en **application/**; compositor `GsiCliApplication` / `BenchCliApplication` en **infrastructure/**.
- Ejemplos: `packages/gsi-gateway`, `packages/gsi-processor`, `apps/gsi-cli`, `apps/gsi-bench-cli`.

Si una tarea cruza capas al revés, **propón refactor** o mover código antes de acoplar.

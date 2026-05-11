# Configuración de `community-web`

Variables de entorno para la app Next.js en `apps/community-web`. Puedes usar **`.env.local`** (prioritario en Next) o **`.env`** en la misma carpeta que `package.json` de la app.

## Base de datos

### PostgreSQL en red (`postgres`)

Valor por defecto de `CS2H_DATABASE_DRIVER` (o sin variable): conexión a un servidor PostgreSQL.

- **`DATABASE_URL`**: cadena `postgresql://…` (obligatoria con este modo).
- Migraciones: `pnpm db:migrate` (desde `apps/community-web`, con las mismas variables).

### Postgres “en fichero” sin Docker (`pglite`)

Para desarrollo en **Node en tu máquina** sin levantar PostgreSQL: [PGlite](https://pglite.dev) ejecuta Postgres en WASM y persiste los datos en un **directorio del disco** (no es SQLite; el esquema Drizzle de `@cs2helper/auth` sigue siendo Postgres).

- **`CS2H_DATABASE_DRIVER`**: `pglite` o `file`.
- **`CS2H_PGLITE_DATA_DIR`**: ruta **relativa al directorio de trabajo** al arrancar la app (con `pnpm dev` desde la app, suele ser la raíz de `community-web`). Por defecto: `.data/pglite`.
- **`DATABASE_URL`**: no hace falta en este modo.

El servidor Next aplica migraciones al arrancar vía `instrumentation` (solo runtime Node, no durante `next build`).

**Producción:** `assertProductionConfig` rechaza `pglite`; en despliegue real usa `postgres` y `DATABASE_URL`.

## Auth y aplicación

| Variable | Descripción |
|----------|-------------|
| `JWT_SECRET` | Firma de JWT (obligatoria; en prod debe ser fuerte). |
| `JWT_ISSUER` / `JWT_AUDIENCE` | Opcionales, claims del token. |
| `APP_URL` o `NEXT_PUBLIC_APP_URL` | URL base sin barra final; en prod es obligatoria. |
| `NEXT_PUBLIC_SITE_NAME` | Nombre mostrado en UI. |
| `TRUST_PROXY` | `true` si hay proxy y quieres confiar en `X-Forwarded-For` para rate limit / IP. |

## Bootstrap de administrador (Steam)

| Variable | Descripción |
|----------|-------------|
| `CS2H_BOOTSTRAP_ROOT_STEAM_ID` | SteamID64 del primer admin cuando **aún no existe** ningún usuario con rol `admin`. Tras crear el primer admin, se ignora. Los demás usuarios entran solo con **invitación** (flujo Steam + código). |

## Registro e invitaciones

| Variable | Descripción |
|----------|-------------|
| `CS2H_DEFAULT_REGISTRATION_ROLE` | Rol por defecto para cuentas nuevas creadas con invitación (p. ej. `member`). Las altas son siempre vía Steam OpenID + código de invitación válido, salvo el bootstrap anterior. |

## Rate limiting y TTL

Ver comentarios en `.env.example`: `CS2H_ACCESS_TOKEN_TTL_SEC`, `CS2H_REFRESH_TOKEN_TTL_SEC`, `CS2H_RATE_LIMIT_LOGIN_PER_MIN`, `CS2H_RATE_LIMIT_ADMIN_PER_MIN`.

## Instancia (`@cs2helper/community-core`)

- Lógica y migraciones en el paquete **`@cs2helper/community-core`** (sin Next). La app aplica migraciones de **auth** y **community-core** juntas con `pnpm db:migrate` o, con **PGlite**, al arrancar el servidor.
- **GET `/api/instance`**: nombre público de la instancia (JSON `{ "displayName": "..." }`).
- **PATCH `/api/instance`**: actualizar `displayName` (cuerpo `{ "displayName": "..." }`); requiere sesión admin (`auth.rbac.manage`).

Con **`postgres`**, ejecuta al menos una vez **`pnpm db:migrate`** antes de usar la API si la BD es nueva (las migraciones no se ejecutan solas en el arranque, igual que con auth).

## OpenAPI y Swagger UI

- **Interfaz**: [http://localhost:3000/docs/api](http://localhost:3000/docs/api) (ajusta host/puerto si hace falta).
- **Especificación JSON**: `GET /api/openapi` (OpenAPI 3.0; `servers[0].url` se infiere del host de la petición).

## Comandos útiles

- Desarrollo con PGlite en disco: copia `.env.example` → `.env.local`, deja `CS2H_DATABASE_DRIVER=pglite`, ejecuta `pnpm dev` en esta app.
- Migraciones desde terminal (útil con `postgres` o para forzar PGlite antes del primer arranque): `pnpm db:migrate` (carga `.env` vía `dotenv`; puedes duplicar variables en `.env` o usar un solo `.env` para CLI y Next).

## Ficheros ignorados

- `.data/`: datos PGlite locales.
- `.env*`: secretos; **`.env.example`** está versionado como plantilla.

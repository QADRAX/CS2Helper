/**
 * OpenAPI 3.0 description of the `community-web` App Router HTTP API.
 * Served at `GET /api/openapi`; UI at `/docs/api`.
 */

const err = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorBody" },
    },
  },
});

export function buildOpenApiDocument(serverUrl: string) {
  return {
    openapi: "3.0.3",
    info: {
      title: "CS2Helper Community Web API",
      version: "0.1.0",
      description: [
        "API HTTP de la app Next.js **community-web** (auth por cookies httpOnly).",
        "",
        "- Tras **GET /api/auth/steam/callback** (tras redirigir desde Steam), el navegador recibe cookies `cs2h_access` y `cs2h_refresh` (no van en JSON).",
        "- El flujo empieza en **GET /api/auth/steam/start** (`invite` y `next` opcionales en query).",
        "- **Try it out**: en rutas protegidas, usa *Authorize* y pega el valor de la cookie `cs2h_access`, o inicia sesión en `/login` en la misma pestaña.",
        "- **POST /api/auth/refresh** requiere la cookie `cs2h_refresh`.",
        "",
        "Errores de dominio auth (`AuthDomainError`) devuelven `{ \"error\": \"<code>\" }` con 401 u otro código según caso.",
      ].join("\n"),
    },
    servers: [{ url: serverUrl }],
    tags: [
      { name: "Health", description: "Comprobación de servicio." },
      {
        name: "Instance",
        description: "Datos públicos de la instalación (`@cs2helper/community-core`).",
      },
      { name: "Auth", description: "Login, sesión, refresh y logout (cookies)." },
      {
        name: "Admin · Invitations",
        description: "Gestión de invitaciones (permiso `auth.invitations.manage`).",
      },
      {
        name: "Admin · Users & RBAC",
        description: "Listado de usuarios y roles (permiso `auth.rbac.manage`).",
      },
    ],
    components: {
      securitySchemes: {
        accessCookie: {
          type: "apiKey",
          in: "cookie",
          name: "cs2h_access",
          description: "JWT de acceso emitido tras login con Steam (httpOnly).",
        },
        refreshCookie: {
          type: "apiKey",
          in: "cookie",
          name: "cs2h_refresh",
          description: "Token de refresco (httpOnly).",
        },
      },
      schemas: {
        ErrorBody: {
          type: "object",
          required: ["error"],
          properties: {
            error: {
              type: "string",
              description:
                "Código de error (p. ej. `unauthorized`, `forbidden`, `rate_limited`, `invalid_json`, códigos `AuthDomainError` como `STEAM_OPENID_INVALID`, `INVITATION_REQUIRED`).",
            },
          },
        },
        OkBody: {
          type: "object",
          required: ["ok"],
          properties: { ok: { type: "boolean", enum: [true] } },
        },
        HealthResponse: {
          type: "object",
          required: ["ok", "service"],
          properties: {
            ok: { type: "boolean" },
            service: { type: "string", example: "community-web" },
          },
        },
        SessionResponse: {
          type: "object",
          required: ["sub", "steamId", "permissions", "roles"],
          properties: {
            sub: { type: "string", description: "Id de usuario (subject JWT)." },
            steamId: { type: "string", description: "SteamID64 del usuario." },
            permissions: {
              type: "array",
              items: { type: "string" },
              description: "Claves de permiso efectivos.",
            },
            roles: { type: "array", items: { type: "string" }, description: "Nombres de rol." },
          },
        },
        InvitationRow: {
          type: "object",
          description: "Invitación serializada (fechas ISO 8601).",
          properties: {
            id: { type: "string" },
            codeHash: { type: "string" },
            createdByUserId: { type: "string" },
            expiresAt: { type: "string", format: "date-time" },
            maxUses: { type: "integer" },
            usesCount: { type: "integer" },
            extraRoleName: { type: "string", nullable: true },
            revokedAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        InvitationsListResponse: {
          type: "object",
          required: ["invitations"],
          properties: {
            invitations: { type: "array", items: { $ref: "#/components/schemas/InvitationRow" } },
          },
        },
        CreateInvitationRequest: {
          type: "object",
          properties: {
            ttlSec: {
              type: "integer",
              minimum: 60,
              default: 86400,
              description: "Segundos hasta la caducidad (mínimo 60).",
            },
            maxUses: { type: "integer", minimum: 1, default: 1 },
            extraRoleName: {
              type: "string",
              nullable: true,
              description: "Rol extra opcional al aceptar la invitación.",
            },
          },
        },
        CreateInvitationResponse: {
          type: "object",
          required: ["invitationId", "plainCode", "expiresAt"],
          properties: {
            invitationId: { type: "string" },
            plainCode: {
              type: "string",
              description: "Código en claro; mostrar solo una vez al cliente.",
            },
            expiresAt: { type: "string", format: "date-time" },
          },
        },
        UserListItem: {
          type: "object",
          properties: {
            id: { type: "string" },
            steamId: { type: "string" },
            displayName: { type: "string", nullable: true },
            avatarUrl: { type: "string", nullable: true },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        UsersListResponse: {
          type: "object",
          required: ["users"],
          properties: {
            users: { type: "array", items: { $ref: "#/components/schemas/UserListItem" } },
          },
        },
        RoleListItem: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        RolesListResponse: {
          type: "object",
          required: ["roles"],
          properties: {
            roles: { type: "array", items: { $ref: "#/components/schemas/RoleListItem" } },
          },
        },
        AssignRoleRequest: {
          type: "object",
          required: ["roleName"],
          properties: {
            roleName: { type: "string", description: "Nombre del rol a asignar." },
          },
        },
        InstanceDisplayNameResponse: {
          type: "object",
          required: ["displayName"],
          properties: {
            displayName: {
              type: "string",
              description: "Nombre visible de esta instancia (homelab / equipo).",
            },
          },
        },
        PatchInstanceDisplayNameRequest: {
          type: "object",
          required: ["displayName"],
          properties: {
            displayName: { type: "string", maxLength: 120 },
          },
        },
      },
      responses: {
        Unauthorized: err("No autenticado o token inválido."),
        Forbidden: err("Autenticado pero sin permiso para esta operación."),
        RateLimited: err("Demasiadas peticiones (rate limit por IP / usuario)."),
        BadRequest: err("JSON inválido o parámetros incorrectos."),
      },
    },
    paths: {
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          operationId: "getHealth",
          responses: {
            "200": {
              description: "Servicio activo.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/HealthResponse" } },
              },
            },
          },
        },
      },
      "/api/instance": {
        get: {
          tags: ["Instance"],
          summary: "Nombre de la instancia",
          operationId: "getInstanceDisplayName",
          responses: {
            "200": {
              description: "Nombre público configurado para esta instalación.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/InstanceDisplayNameResponse" },
                },
              },
            },
          },
        },
        patch: {
          tags: ["Instance"],
          summary: "Actualizar nombre de la instancia",
          description: "Requiere rol admin vía permiso `auth.rbac.manage`.",
          operationId: "patchInstanceDisplayName",
          security: [{ accessCookie: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PatchInstanceDisplayNameRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Actualizado.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/OkBody" } },
              },
            },
            "400": {
              description: "Validación (`INSTANCE_DISPLAY_NAME_INVALID`, etc.).",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorBody" } },
              },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/Forbidden" },
            "429": { $ref: "#/components/responses/RateLimited" },
          },
        },
      },
      "/api/auth/steam/start": {
        get: {
          tags: ["Auth"],
          summary: "Iniciar login con Steam (OpenID 2.0)",
          description:
            "Redirige 302 a Steam. Establece cookie de estado firmada. Query opcional: `invite`, `next`. Puede responder 429 (rate limit) o 500 (`missing_app_url`).",
          operationId: "getAuthSteamStart",
          parameters: [
            {
              name: "invite",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "next",
              in: "query",
              required: false,
              schema: { type: "string", example: "/admin" },
            },
          ],
          responses: {
            "302": {
              description: "Redirección a steamcommunity.com/openid/login.",
            },
            "429": { $ref: "#/components/responses/RateLimited" },
            "500": {
              description: "Config incompleta (p. ej. sin APP_URL).",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorBody" } },
              },
            },
          },
        },
      },
      "/api/auth/steam/callback": {
        get: {
          tags: ["Auth"],
          summary: "Callback OpenID de Steam",
          description:
            "Completa verificación con Steam, emite sesión y redirige a `next` con cookies `cs2h_access` y `cs2h_refresh`. Errores → redirección a `/login?error=...`.",
          operationId: "getAuthSteamCallback",
          responses: {
            "302": {
              description: "Redirección a la app con cookies o a login con error.",
            },
          },
        },
      },
      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Cerrar sesión",
          description:
            "Borra cookies de acceso/refresco en el cliente y revoca el refresh en servidor si se envía la cookie `cs2h_refresh`. No requiere cuerpo JSON.",
          operationId: "postAuthLogout",
          responses: {
            "200": {
              description: "Siempre `{ ok: true }` (revocación en servidor best-effort).",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/OkBody" } },
              },
            },
          },
        },
      },
      "/api/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Renovar access token",
          description:
            "Usa la cookie `cs2h_refresh`. Respuesta 200 con `{ ok: true }` y nuevas cookies.",
          operationId: "postAuthRefresh",
          security: [{ refreshCookie: [] }],
          responses: {
            "200": {
              description: "Tokens renovados.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/OkBody" } },
              },
            },
            "401": {
              description: "Sin refresh o refresh inválido (`no_refresh`, `REFRESH_TOKEN_INVALID`, etc.).",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorBody" } },
              },
            },
            "429": { $ref: "#/components/responses/RateLimited" },
          },
        },
      },
      "/api/auth/session": {
        get: {
          tags: ["Auth"],
          summary: "Sesión actual (claims)",
          operationId: "getAuthSession",
          security: [{ accessCookie: [] }],
          responses: {
            "200": {
              description: "Claims del access token.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/SessionResponse" } },
              },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/api/admin/invitations": {
        get: {
          tags: ["Admin · Invitations"],
          summary: "Listar invitaciones",
          operationId: "listInvitations",
          security: [{ accessCookie: [] }],
          responses: {
            "200": {
              description: "Lista de invitaciones.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/InvitationsListResponse" },
                },
              },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/Forbidden" },
            "429": { $ref: "#/components/responses/RateLimited" },
          },
        },
        post: {
          tags: ["Admin · Invitations"],
          summary: "Crear invitación",
          operationId: "createInvitation",
          security: [{ accessCookie: [] }],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateInvitationRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Invitación creada; incluye `plainCode` una sola vez.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CreateInvitationResponse" },
                },
              },
            },
            "400": { $ref: "#/components/responses/BadRequest" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/Forbidden" },
            "429": { $ref: "#/components/responses/RateLimited" },
          },
        },
      },
      "/api/admin/invitations/{id}/revoke": {
        post: {
          tags: ["Admin · Invitations"],
          summary: "Revocar invitación",
          operationId: "revokeInvitation",
          security: [{ accessCookie: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Id de la invitación.",
            },
          ],
          responses: {
            "200": {
              description: "Revocada (o idempotente).",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/OkBody" } },
              },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/Forbidden" },
            "429": { $ref: "#/components/responses/RateLimited" },
          },
        },
      },
      "/api/admin/users": {
        get: {
          tags: ["Admin · Users & RBAC"],
          summary: "Listar usuarios",
          operationId: "listUsers",
          security: [{ accessCookie: [] }],
          responses: {
            "200": {
              description: "Lista de usuarios.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/UsersListResponse" } },
              },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/Forbidden" },
            "429": { $ref: "#/components/responses/RateLimited" },
          },
        },
      },
      "/api/admin/roles": {
        get: {
          tags: ["Admin · Users & RBAC"],
          summary: "Listar roles",
          operationId: "listRoles",
          security: [{ accessCookie: [] }],
          responses: {
            "200": {
              description: "Lista de roles.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/RolesListResponse" } },
              },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/Forbidden" },
            "429": { $ref: "#/components/responses/RateLimited" },
          },
        },
      },
      "/api/admin/users/{userId}/roles": {
        post: {
          tags: ["Admin · Users & RBAC"],
          summary: "Asignar rol a usuario",
          operationId: "assignUserRole",
          security: [{ accessCookie: [] }],
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AssignRoleRequest" } },
            },
          },
          responses: {
            "200": {
              description: "Rol asignado.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/OkBody" } },
              },
            },
            "400": { $ref: "#/components/responses/BadRequest" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/Forbidden" },
            "429": { $ref: "#/components/responses/RateLimited" },
          },
        },
        delete: {
          tags: ["Admin · Users & RBAC"],
          summary: "Quitar rol de usuario",
          description: "Query **`roleName`** obligatorio.",
          operationId: "removeUserRole",
          security: [{ accessCookie: [] }],
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "roleName",
              in: "query",
              required: true,
              schema: { type: "string" },
              description: "Nombre del rol a eliminar.",
            },
          ],
          responses: {
            "200": {
              description: "Rol eliminado del usuario.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/OkBody" } },
              },
            },
            "400": { $ref: "#/components/responses/BadRequest" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/Forbidden" },
            "429": { $ref: "#/components/responses/RateLimited" },
          },
        },
      },
    },
  };
}

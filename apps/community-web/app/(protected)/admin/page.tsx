import Link from "next/link";
import {
  AUTH_INVITATIONS_MANAGE_PERMISSION,
  AUTH_RBAC_MANAGE_PERMISSION,
  effectiveKeysGrantPermission,
} from "@cs2helper/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionFromCookies } from "@/lib/session";

export default async function AdminHomePage() {
  const session = await getSessionFromCookies();
  if (!session) return null;
  const keys = [...session.permissions];
  const canInvite = effectiveKeysGrantPermission(keys, AUTH_INVITATIONS_MANAGE_PERMISSION);
  const canRbac = effectiveKeysGrantPermission(keys, AUTH_RBAC_MANAGE_PERMISSION);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-mono text-2xl font-black">Administración</h1>
      <p className="max-w-prose font-mono text-sm">
        Conectado como <span className="font-bold">{session.email}</span>
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {canInvite ? (
          <Link href="/admin/invitations">
            <Card className="h-full transition-transform hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle>Invitaciones</CardTitle>
              </CardHeader>
              <CardContent className="font-mono text-sm">
                Crear enlaces de invitación y revocar códigos activos.
              </CardContent>
            </Card>
          </Link>
        ) : null}
        {canRbac ? (
          <Link href="/admin/users">
            <Card className="h-full transition-transform hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle>Usuarios y roles</CardTitle>
              </CardHeader>
              <CardContent className="font-mono text-sm">
                Listar miembros y asignar o quitar roles.
              </CardContent>
            </Card>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

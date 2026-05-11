"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UserRow = {
  id: string;
  steamId: string;
  displayName: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
};
type RoleRow = { id: string; name: string };

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [rolePick, setRolePick] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const [uRes, rRes] = await Promise.all([
      fetch("/api/admin/users"),
      fetch("/api/admin/roles"),
    ]);
    if (!uRes.ok || !rRes.ok) {
      setErr("forbidden");
      return;
    }
    const uj = (await uRes.json()) as { users: UserRow[] };
    const rj = (await rRes.json()) as { roles: RoleRow[] };
    setUsers(uj.users);
    setRoles(rj.roles);
    setErr(null);
  }

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, []);

  async function assign(userId: string) {
    const roleName = rolePick[userId]?.trim();
    if (!roleName) return;
    const res = await fetch(`/api/admin/users/${userId}/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleName }),
    });
    if (!res.ok) setErr("assign_failed");
    await load();
  }

  async function removeRole(userId: string, roleName: string) {
    const res = await fetch(
      `/api/admin/users/${userId}/roles?roleName=${encodeURIComponent(roleName)}`,
      { method: "DELETE" }
    );
    if (!res.ok) setErr("remove_failed");
    await load();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-mono text-2xl font-black">Usuarios y roles</h1>
      {err ? <p className="font-mono text-sm text-red-600">{err}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Miembros</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b-[3px] border-border text-left">
                <th className="p-2">Perfil</th>
                <th className="p-2">SteamID64</th>
                <th className="p-2">Rol a asignar</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b-2 border-border">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt=""
                          className="h-8 w-8 shrink-0 rounded border-2 border-border"
                          width={32}
                          height={32}
                        />
                      ) : (
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border-2 border-border bg-muted text-[10px]">
                          —
                        </span>
                      )}
                      <span className="font-bold">{u.displayName ?? "—"}</span>
                    </div>
                  </td>
                  <td className="p-2 text-[11px] text-muted-foreground">{u.steamId}</td>
                  <td className="p-2">
                    <select
                      className="h-9 w-full max-w-[160px] border-[3px] border-border bg-card px-2 font-bold"
                      value={rolePick[u.id] ?? ""}
                      onChange={(e) =>
                        setRolePick((m) => ({
                          ...m,
                          [u.id]: e.target.value,
                        }))
                      }
                    >
                      <option value="">—</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="flex flex-wrap gap-2 p-2">
                    <Button type="button" size="sm" onClick={() => void assign(u.id)}>
                      Asignar
                    </Button>
                    {roles.map((r) => (
                      <Button
                        key={r.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void removeRole(u.id, r.name)}
                      >
                        Quitar {r.name}
                      </Button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Row = {
  id: string;
  createdByUserId: string;
  expiresAt: string;
  maxUses: number;
  usesCount: number;
  extraRoleName: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export default function InvitationsAdminPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [ttlSec, setTtlSec] = useState("86400");
  const [maxUses, setMaxUses] = useState("1");
  const [extraRole, setExtraRole] = useState("");
  const [plainCode, setPlainCode] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/invitations");
    if (!res.ok) {
      setErr("forbidden");
      return;
    }
    const j = (await res.json()) as { invitations: Row[] };
    setRows(j.invitations);
    setErr(null);
  }

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, []);

  async function createInvitation(e: React.FormEvent) {
    e.preventDefault();
    setPlainCode(null);
    const res = await fetch("/api/admin/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ttlSec: Number(ttlSec),
        maxUses: Number(maxUses),
        extraRoleName: extraRole.trim() || null,
      }),
    });
    if (!res.ok) {
      setErr("create_failed");
      return;
    }
    const j = (await res.json()) as { plainCode: string };
    setPlainCode(j.plainCode);
    await load();
  }

  async function revoke(id: string) {
    const res = await fetch(`/api/admin/invitations/${id}/revoke`, { method: "POST" });
    if (!res.ok) setErr("revoke_failed");
    await load();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-mono text-2xl font-black">Invitaciones</h1>

      <Card>
        <CardHeader>
          <CardTitle>Nueva invitación</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void createInvitation(e)} className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="font-mono text-xs font-bold">TTL (segundos)</label>
                <Input value={ttlSec} onChange={(e) => setTtlSec(e.target.value)} />
              </div>
              <div>
                <label className="font-mono text-xs font-bold">Usos máx.</label>
                <Input value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
              </div>
              <div>
                <label className="font-mono text-xs font-bold">Rol extra (opcional)</label>
                <Input
                  placeholder="member"
                  value={extraRole}
                  onChange={(e) => setExtraRole(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit">Crear</Button>
            {plainCode ? (
              <p className="break-all font-mono text-sm font-bold">
                Código (copiar ahora): {plainCode}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {err ? <p className="font-mono text-sm text-red-600">{err}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Activas / historial</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b-[3px] border-border text-left">
                <th className="p-2">ID</th>
                <th className="p-2">Usos</th>
                <th className="p-2">Expira</th>
                <th className="p-2">Estado</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b-2 border-border">
                  <td className="max-w-[120px] truncate p-2">{r.id}</td>
                  <td className="p-2">
                    {r.usesCount}/{r.maxUses}
                  </td>
                  <td className="p-2">{new Date(r.expiresAt).toLocaleString()}</td>
                  <td className="p-2">
                    {r.revokedAt ? "Revocada" : new Date(r.expiresAt) < new Date() ? "Expirada" : "Activa"}
                  </td>
                  <td className="p-2">
                    {!r.revokedAt && new Date(r.expiresAt) >= new Date() ? (
                      <Button type="button" variant="outline" size="sm" onClick={() => void revoke(r.id)}>
                        Revocar
                      </Button>
                    ) : null}
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

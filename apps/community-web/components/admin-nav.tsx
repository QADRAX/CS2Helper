"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function AdminNav({
  siteName,
  canInvite,
  canRbac,
}: {
  siteName: string;
  canInvite: boolean;
  canRbac: boolean;
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="nb-border nb-shadow-sm bg-card">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/admin" className="font-black tracking-tight">
          {siteName}
        </Link>
        <nav className="flex flex-wrap items-center gap-2 font-mono text-sm font-bold">
          <Link className="underline decoration-2 underline-offset-4" href="/admin">
            Inicio
          </Link>
          {canInvite ? (
            <Link className="underline decoration-2 underline-offset-4" href="/admin/invitations">
              Invitaciones
            </Link>
          ) : null}
          {canRbac ? (
            <Link className="underline decoration-2 underline-offset-4" href="/admin/users">
              Usuarios
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => void logout()}
            className="underline decoration-2 underline-offset-4"
          >
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
}

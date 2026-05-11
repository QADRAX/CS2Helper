"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function describeError(code: string | null): string | null {
  if (!code) return null;
  switch (code) {
    case "INVITATION_REQUIRED":
      return "Se requiere un código de invitación (o configurar el primer admin por SteamID).";
    case "INVITATION_INVALID":
      return "Código de invitación inválido o caducado.";
    case "STEAM_OPENID_INVALID":
      return "La verificación con Steam falló. Vuelve a intentarlo.";
    case "steam_state_invalid":
      return "Sesión de login caducada o inválida. Vuelve a iniciar desde Steam.";
    case "USER_INACTIVE":
      return "Cuenta desactivada.";
    default:
      return code;
  }
}

export function LoginForm() {
  const search = useSearchParams();
  const next = search.get("next") ?? "/admin";
  const urlError = search.get("error");
  const [invite, setInvite] = useState("");

  const errorLine = useMemo(() => describeError(urlError), [urlError]);

  const steamHref = useMemo(() => {
    const params = new URLSearchParams();
    if (invite.trim()) params.set("invite", invite.trim());
    params.set(
      "next",
      next.startsWith("/") && !next.startsWith("//") ? next : "/admin"
    );
    return `/api/auth/steam/start?${params.toString()}`;
  }, [invite, next]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-mono">Acceso con Steam</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="font-mono text-xs text-muted-foreground">
            Solo identidad verificada por Steam. Si es tu primer acceso, necesitas un código de
            invitación (salvo el primer administrador configurado en el servidor).
          </p>
          <div className="flex flex-col gap-1">
            <label htmlFor="invite" className="font-mono text-xs font-bold uppercase">
              Código de invitación (opcional si ya tienes cuenta)
            </label>
            <Input
              id="invite"
              type="text"
              autoComplete="off"
              placeholder="Pega el código aquí antes de continuar"
              value={invite}
              onChange={(e) => setInvite(e.target.value)}
            />
          </div>
          {errorLine ? (
            <p className="font-mono text-xs font-bold text-red-600 dark:text-red-400">{errorLine}</p>
          ) : null}
          <Button asChild className="w-full">
            <a href={steamHref}>Continuar con Steam</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

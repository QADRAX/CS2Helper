import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 font-mono text-sm">Cargando…</div>}>
      <LoginForm />
    </Suspense>
  );
}

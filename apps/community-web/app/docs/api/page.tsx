"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const Swagger = dynamic(() => import("@/components/api-docs/swagger-ui"), {
  ssr: false,
  loading: () => (
    <div className="border border-black bg-white p-6 font-mono text-sm shadow-[4px_4px_0_0_#000]">
      Cargando Swagger UI…
    </div>
  ),
});

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-[#f4f4f0] text-[#111]">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b-4 border-black bg-[#ffe66d] px-4 py-3 font-mono text-sm shadow-[0_4px_0_0_#000]">
        <div>
          <span className="font-black uppercase tracking-tight">community-web</span>
          <span className="text-neutral-700"> · OpenAPI 3.0</span>
        </div>
        <nav className="flex flex-wrap gap-3 font-bold">
          <a
            href="/api/openapi"
            className="border-2 border-black bg-white px-2 py-1 shadow-[3px_3px_0_0_#000] hover:translate-x-px hover:translate-y-px hover:shadow-none"
          >
            openapi.json
          </a>
          <Link
            href="/login"
            className="border-2 border-black bg-white px-2 py-1 shadow-[3px_3px_0_0_#000] hover:translate-x-px hover:translate-y-px hover:shadow-none"
          >
            Login
          </Link>
          <Link
            href="/"
            className="border-2 border-black bg-white px-2 py-1 shadow-[3px_3px_0_0_#000] hover:translate-x-px hover:translate-y-px hover:shadow-none"
          >
            Inicio
          </Link>
        </nav>
      </header>
      <div className="swagger-docs mx-auto max-w-[min(100%,1400px)] px-2 py-4 pb-16">
        <Swagger />
      </div>
    </div>
  );
}

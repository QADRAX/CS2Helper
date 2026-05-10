import { type NextRequest, NextResponse } from "next/server";
import { buildOpenApiDocument } from "@/lib/openapi/document";

function inferServerUrl(request: NextRequest): string {
  const host = request.headers.get("host") ?? "localhost:3000";
  const forwarded = request.headers.get("x-forwarded-proto");
  const proto =
    forwarded ??
    (request.headers.get("x-forwarded-ssl") === "on" ? "https" : null) ??
    (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}`;
}

/** OpenAPI 3.0 JSON for Swagger UI and herramientas externas. */
export async function GET(request: NextRequest) {
  const doc = buildOpenApiDocument(inferServerUrl(request));
  return NextResponse.json(doc, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API · CS2 Community",
  description: "OpenAPI 3.0 y Swagger UI para community-web.",
};

export default function DocsApiLayout({ children }: { children: React.ReactNode }) {
  return children;
}

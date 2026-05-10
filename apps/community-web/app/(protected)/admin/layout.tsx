import { redirect } from "next/navigation";
import {
  AUTH_INVITATIONS_MANAGE_PERMISSION,
  AUTH_RBAC_MANAGE_PERMISSION,
  effectiveKeysGrantPermission,
} from "@cs2helper/auth";
import { AdminNav } from "@/components/admin-nav";
import { getSessionFromCookies } from "@/lib/session";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?next=/admin");
  }
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "CS2 Community";
  const keys = [...session.permissions];
  const canInvite = effectiveKeysGrantPermission(keys, AUTH_INVITATIONS_MANAGE_PERMISSION);
  const canRbac = effectiveKeysGrantPermission(keys, AUTH_RBAC_MANAGE_PERMISSION);

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNav siteName={siteName} canInvite={canInvite} canRbac={canRbac} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}

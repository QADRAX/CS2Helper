export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { loadConfig, assertProductionConfig } = await import("./lib/config");
  const { initAuthFromConfig } = await import("./lib/auth/init-runtime");
  const { getAuthService } = await import("./lib/auth/service");
  const { AuthDomainError } = await import("@cs2helper/auth");

  const c = loadConfig();
  try {
    assertProductionConfig(c);
  } catch (e) {
    console.error("[instrumentation] config:", e);
  }

  await initAuthFromConfig(c);

  const email = c.bootstrapRootEmail;
  const password = c.bootstrapRootPassword;
  if (!email || !password) return;

  const auth = getAuthService();

  if (c.bootstrapRootUpdatePassword) {
    try {
      await auth.resetRootAdminPasswordFromBootstrap(email, password);
      return;
    } catch (e) {
      if (e instanceof AuthDomainError && e.code === "USER_NOT_FOUND") {
        const { created } = await auth.ensureRootUserFromBootstrap({ email, password });
        if (!created) {
          console.warn(
            "[instrumentation] bootstrap: CS2H_BOOTSTRAP_ROOT_UPDATE_PASSWORD: usuario no encontrado, " +
              "pero ya existe un admin (ensureRoot no creó usuario). Revisa CS2H_BOOTSTRAP_ROOT_EMAIL."
          );
        }
        return;
      }
      throw e;
    }
  }

  if (c.bootstrapRootEnabled) {
    await auth.ensureRootUserFromBootstrap({ email, password });
  }
}

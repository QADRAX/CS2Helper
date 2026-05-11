export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { loadConfig, assertProductionConfig } = await import("./lib/config");
  const { initAuthFromConfig } = await import("./lib/auth/init-runtime");

  const c = loadConfig();
  try {
    assertProductionConfig(c);
  } catch (e) {
    console.error("[instrumentation] config:", e);
  }

  await initAuthFromConfig(c);
}

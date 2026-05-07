/**
 * Aplana un árbol de mensajes hasta hojas `string`; la ruta forma el id tipo `cli.menu.title`.
 */
export function flattenNestedMessages(node: Record<string, unknown>, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [segment, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${segment}` : segment;
    if (typeof value === "string") {
      out[path] = value;
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(out, flattenNestedMessages(value as Record<string, unknown>, path));
    }
  }
  return out;
}

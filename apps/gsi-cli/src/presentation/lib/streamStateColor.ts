import type { StreamState } from "@cs2helper/gsi-processor";

export function streamStateColor(state: StreamState): string {
  switch (state) {
    case "healthy":
      return "green";
    case "recovering":
    case "gap":
      return "yellow";
    case "degraded":
      return "red";
    case "cold_start":
    default:
      return "gray";
  }
}

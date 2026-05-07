import { Box, Text } from "ink";
import type { NotificationItem } from "../../store";

interface NotificationToastProps {
  notification: NotificationItem;
  nowMs: number;
}

const BAR_WIDTH = 18;

export function NotificationToast({ notification, nowMs }: NotificationToastProps) {
  const elapsedMs = Math.max(0, nowMs - notification.createdAtMs);
  const remainingRatio = Math.max(0, 1 - elapsedMs / notification.durationMs);
  const filled = Math.round(remainingRatio * BAR_WIDTH);
  const empty = BAR_WIDTH - filled;
  const bar = `${"#".repeat(filled)}${"-".repeat(empty)}`;

  const color =
    notification.kind === "warning"
      ? "yellow"
      : notification.kind === "success"
        ? "green"
        : notification.kind === "error"
          ? "red"
          : "cyan";

  return (
    <Box flexDirection="column" borderStyle="single" paddingX={1}>
      <Text color={color}>
        {notification.kind.toUpperCase()}: {notification.message}
      </Text>
      <Text color="gray">[{bar}]</Text>
    </Box>
  );
}

import { useEffect, useState } from "react";
import { Box } from "ink";
import { useAppDispatch } from "../../hooks/redux";
import { pruneExpiredNotifications, type NotificationItem } from "../../store";
import { NotificationToast } from "../atoms/NotificationToast";

interface NotificationsStackProps {
  notifications: NotificationItem[];
}

export function NotificationsStack({ notifications }: NotificationsStackProps) {
  const dispatch = useAppDispatch();
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNowMs(now);
      dispatch(pruneExpiredNotifications(now));
    }, 120);
    return () => clearInterval(interval);
  }, [dispatch]);

  if (notifications.length === 0) return null;

  return (
    <Box flexDirection="column" gap={1} width="100%">
      {notifications.map((item) => (
        <NotificationToast key={item.id} notification={item} nowMs={nowMs} />
      ))}
    </Box>
  );
}

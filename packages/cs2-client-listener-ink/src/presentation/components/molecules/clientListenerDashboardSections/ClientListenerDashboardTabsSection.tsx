import { useMemo } from "react";
import { HotkeyTabStrip } from "../../atoms/hotkeyTabStrip";
import { clientListenerDashboardSelectors, useClientListenerDashboard } from "../../../contexts/clientListenerDashboardContext";

/** Hotkey tab strip bound to dashboard context. */
export function ClientListenerDashboardTabsSection() {
  const ctx = useClientListenerDashboard();
  const props = useMemo(() => clientListenerDashboardSelectors.hotkeyTabStrip(ctx), [ctx]);
  return <HotkeyTabStrip tabs={props.tabs} activeIndex={props.activeIndex} hint={props.hint} />;
}

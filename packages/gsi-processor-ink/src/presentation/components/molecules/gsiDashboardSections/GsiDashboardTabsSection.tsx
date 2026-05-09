import { useMemo } from "react";
import { HotkeyTabStrip } from "../../atoms/hotkeyTabStrip";
import { gsiDashboardSelectors, useGsiDashboard } from "../../../contexts/gsiDashboardContext";

/** Hotkey tab strip bound to dashboard context. */
export function GsiDashboardTabsSection() {
  const ctx = useGsiDashboard();
  const props = useMemo(() => gsiDashboardSelectors.hotkeyTabStrip(ctx), [ctx]);
  return <HotkeyTabStrip tabs={props.tabs} activeIndex={props.activeIndex} hint={props.hint} />;
}

import { BorderedPanel } from "../../atoms/borderedPanel";
import { GridRowList } from "../../atoms/gridRowList";
import { useClientListenerDashboard } from "../../../contexts/clientListenerDashboardContext";

/** Stream tab: GSI processor health + HTTP gateway counters. */
export function ClientListenerDashboardStreamSection() {
  const ctx = useClientListenerDashboard();
  if (ctx.activeTab !== 0) {
    return null;
  }
  return (
    <BorderedPanel title={ctx.streamPanel.title}>
      <GridRowList rows={ctx.streamPanel.rows} />
    </BorderedPanel>
  );
}

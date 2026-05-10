import { BorderedPanel } from "../../atoms/borderedPanel";
import { GridRowList } from "../../atoms/gridRowList";
import { useClientListenerDashboard } from "../../../contexts/clientListenerDashboardContext";

/** Performance tab: CPU / GPU / FPS from the tick hub `performance` source. */
export function ClientListenerDashboardPerformanceSection() {
  const ctx = useClientListenerDashboard();
  if (ctx.activeTab !== 2) {
    return null;
  }
  return (
    <BorderedPanel title={ctx.performancePanel.title}>
      <GridRowList rows={ctx.performancePanel.rows} />
    </BorderedPanel>
  );
}

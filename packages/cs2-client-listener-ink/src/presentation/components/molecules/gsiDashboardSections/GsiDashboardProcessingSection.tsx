import { BorderedPanel } from "../../atoms/borderedPanel";
import { GridRowList } from "../../atoms/gridRowList";
import { useGsiDashboard } from "../../../contexts/gsiDashboardContext";

/** Processing tab panel (stream + gateway counters). */
export function GsiDashboardProcessingSection() {
  const ctx = useGsiDashboard();
  if (ctx.activeTab !== 0) {
    return null;
  }
  return (
    <BorderedPanel title={ctx.processingPanel.title}>
      <GridRowList rows={ctx.processingPanel.rows} />
    </BorderedPanel>
  );
}

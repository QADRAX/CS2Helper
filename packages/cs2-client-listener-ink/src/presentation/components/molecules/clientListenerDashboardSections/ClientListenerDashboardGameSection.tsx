import { BorderedPanel } from "../../atoms/borderedPanel";
import { DimSectionLabel } from "../../atoms/dimSectionLabel";
import { GridRowList } from "../../atoms/gridRowList";
import { useClientListenerDashboard } from "../../../contexts/clientListenerDashboardContext";

/** Game tab: match / HUD rows plus optional GSI `provider` block. */
export function ClientListenerDashboardGameSection() {
  const ctx = useClientListenerDashboard();
  const panel = ctx.gamePanel;
  if (ctx.activeTab !== 1) {
    return null;
  }
  return (
    <BorderedPanel title={panel.title}>
      <GridRowList rows={panel.rows} />
      {panel.providerBlock ? (
        <>
          <DimSectionLabel>{panel.providerBlock.heading}</DimSectionLabel>
          <GridRowList rows={panel.providerBlock.rows} />
        </>
      ) : null}
    </BorderedPanel>
  );
}

import { useMemo } from "react";
import { AlertPrefixLine } from "../../atoms/alertPrefixLine";
import { InkHeading } from "../../atoms/inkHeading";
import { WaitingSpinner } from "../../atoms/waitingSpinner";
import { clientListenerDashboardSelectors, useClientListenerDashboard } from "../../../contexts/clientListenerDashboardContext";

/** Title, optional gateway warning, and CS2 wait spinner. */
export function ClientListenerDashboardChromeSection() {
  const ctx = useClientListenerDashboard();
  const slice = useMemo(() => clientListenerDashboardSelectors.chrome(ctx), [ctx]);

  return (
    <>
      <InkHeading variant="page">{slice.title}</InkHeading>
      {slice.gatewayWarning ? (
        <AlertPrefixLine prefix={slice.warningPrefix} message={slice.gatewayWarning} />
      ) : null}
      <WaitingSpinner active={slice.waitingForCs2} format={slice.spinner} />
    </>
  );
}

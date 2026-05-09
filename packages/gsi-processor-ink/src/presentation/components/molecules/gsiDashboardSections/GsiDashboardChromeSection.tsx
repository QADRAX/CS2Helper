import { useMemo } from "react";
import { AlertPrefixLine } from "../../atoms/alertPrefixLine";
import { InkHeading } from "../../atoms/inkHeading";
import { WaitingSpinner } from "../../atoms/waitingSpinner";
import { gsiDashboardSelectors, useGsiDashboard } from "../../../contexts/gsiDashboardContext";

/** Title, optional gateway warning, and CS2 wait spinner. */
export function GsiDashboardChromeSection() {
  const ctx = useGsiDashboard();
  const slice = useMemo(() => gsiDashboardSelectors.chrome(ctx), [ctx]);

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

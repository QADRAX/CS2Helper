import { Box } from "ink";
import { useAppSelector } from "../../hooks/redux";
import {
  selectPresentMonBootstrapBlocking,
  selectPresentMonBootstrapStepKey,
} from "../../store";
import { PresentMonStartupLoader } from "../molecules/PresentMonStartupLoader";
import { InteractiveCli } from "./InteractiveCli";

/**
 * Gates the main CLI on PresentMon startup bootstrap; errors are non-blocking (notification).
 */
export function AppShell() {
  const blocking = useAppSelector(selectPresentMonBootstrapBlocking);
  const stepKey = useAppSelector(selectPresentMonBootstrapStepKey);

  if (blocking) {
    return (
      <Box width="100%">
        <PresentMonStartupLoader stepKey={stepKey} />
      </Box>
    );
  }

  return <InteractiveCli />;
}

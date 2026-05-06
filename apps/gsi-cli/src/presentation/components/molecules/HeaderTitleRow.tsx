import { Box } from "ink";
import { RecordingBadge } from "../atoms/RecordingBadge";
import { TitleHeading } from "../atoms/TitleHeading";

interface HeaderTitleRowProps {
  recordingPath: string | undefined;
}

export function HeaderTitleRow({ recordingPath }: HeaderTitleRowProps) {
  return (
    <Box justifyContent="space-between">
      <TitleHeading />
      {recordingPath ? <RecordingBadge path={recordingPath} /> : null}
    </Box>
  );
}

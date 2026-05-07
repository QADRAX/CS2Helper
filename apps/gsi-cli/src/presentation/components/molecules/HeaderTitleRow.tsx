import { Box } from "ink";
import { RecordingBadge } from "../atoms/RecordingBadge";
import { TitleHeading } from "../atoms/TitleHeading";

interface HeaderTitleRowProps {
  recordingPath: string | undefined;
  maxWidth: number;
}

export function HeaderTitleRow({ recordingPath, maxWidth }: HeaderTitleRowProps) {
  return (
    <Box flexDirection="column" width={maxWidth} gap={1}>
      <TitleHeading />
      {recordingPath ? <RecordingBadge path={recordingPath} maxWidth={maxWidth} /> : null}
    </Box>
  );
}

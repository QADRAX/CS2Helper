import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { MenuOptionLine } from "../atoms/MenuOptionLine";

interface ConfigScreenProps {
  configCursor: number;
  configPortDraft: string;
  configThrottleDraft: string;
  configHeartbeatDraft: string;
  autoRecordEnabled: boolean;
  onConfigPortChange: (value: string) => void;
  onConfigThrottleChange: (value: string) => void;
  onConfigHeartbeatChange: (value: string) => void;
}

export function ConfigScreen({
  configCursor,
  configPortDraft,
  configThrottleDraft,
  configHeartbeatDraft,
  autoRecordEnabled,
  onConfigPortChange,
  onConfigThrottleChange,
  onConfigHeartbeatChange,
}: ConfigScreenProps) {
  return (
    <>
      <Text bold>Configuration</Text>
      <MenuOptionLine label="port:" focused={configCursor === 0} />
      <Box marginLeft={2}>
        <TextInput
          value={configPortDraft}
          onChange={onConfigPortChange}
          placeholder="27015"
          focus={configCursor === 0}
        />
      </Box>
      <MenuOptionLine label="gsi throttle (sec):" focused={configCursor === 1} />
      <Box marginLeft={2}>
        <TextInput
          value={configThrottleDraft}
          onChange={onConfigThrottleChange}
          placeholder="0.1"
          focus={configCursor === 1}
        />
      </Box>
      <MenuOptionLine label="gsi heartbeat (sec):" focused={configCursor === 2} />
      <Box marginLeft={2}>
        <TextInput
          value={configHeartbeatDraft}
          onChange={onConfigHeartbeatChange}
          placeholder="10"
          focus={configCursor === 2}
        />
      </Box>
      <MenuOptionLine
        label={`auto record on start: ${autoRecordEnabled ? "true" : "false"}`}
        focused={configCursor === 3}
      />
      <MenuOptionLine label="save" focused={configCursor === 4} activeColor="green" />
      <MenuOptionLine label="create cfg" focused={configCursor === 5} activeColor="cyan" />
      <MenuOptionLine label="open data folder" focused={configCursor === 6} activeColor="cyan" />
      <MenuOptionLine label="cancel" focused={configCursor === 7} activeColor="yellow" />
      <Text color="gray">Up/Down to navigate, Enter to confirm, Esc to cancel</Text>
    </>
  );
}

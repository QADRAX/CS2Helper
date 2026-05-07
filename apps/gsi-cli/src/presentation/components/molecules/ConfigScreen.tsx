import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { MenuOptionLine } from "../atoms/MenuOptionLine";

interface ConfigScreenProps {
  configCursor: number;
  configPortDraft: string;
  onConfigPortChange: (value: string) => void;
}

export function ConfigScreen({
  configCursor,
  configPortDraft,
  onConfigPortChange,
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
      <MenuOptionLine label="save" focused={configCursor === 1} activeColor="green" />
      <MenuOptionLine label="create cfg" focused={configCursor === 2} activeColor="cyan" />
      <MenuOptionLine label="cancel" focused={configCursor === 3} activeColor="yellow" />
      <Text color="gray">Up/Down to navigate, Enter to confirm, Esc to cancel</Text>
    </>
  );
}

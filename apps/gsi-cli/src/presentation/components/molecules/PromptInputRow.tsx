import { Box } from "ink";
import TextInput from "ink-text-input";
import { PromptGlyph } from "../atoms/PromptGlyph";

interface PromptInputRowProps {
  inputKey: number;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export function PromptInputRow({ inputKey, value, onChange, onSubmit }: PromptInputRowProps) {
  return (
    <Box>
      <Box marginRight={1}>
        <PromptGlyph />
      </Box>
      <TextInput key={inputKey} value={value} onChange={onChange} onSubmit={onSubmit} />
    </Box>
  );
}

import { Box } from "ink";
import { executeCliCommand } from "../../store";
import { usePrompt } from "../../hooks/usePrompt";
import { useAppDispatch } from "../../hooks/redux";
import { PromptInputRow } from "../molecules/PromptInputRow";
import { PromptSuggestionRow } from "../molecules/PromptSuggestionRow";

interface InteractiveCommandPromptProps {
  contentWidth: number;
}

export function InteractiveCommandPrompt({ contentWidth }: InteractiveCommandPromptProps) {
  const dispatch = useAppDispatch();
  const { query, inputKey, availableOptions, suggestionIndex, onQueryChange, flushPrompt } =
    usePrompt();

  const handleSubmit = (raw: string) => {
    const cmd = flushPrompt(raw);
    void dispatch(executeCliCommand(cmd));
  };

  return (
    <Box flexDirection="column" width={contentWidth}>
      <PromptSuggestionRow
        options={availableOptions}
        activeIndex={suggestionIndex}
        contentWidth={contentWidth}
      />
      <PromptInputRow
        inputKey={inputKey}
        value={query}
        onChange={onQueryChange}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}

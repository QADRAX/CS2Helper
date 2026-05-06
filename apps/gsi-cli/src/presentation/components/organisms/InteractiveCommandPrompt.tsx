import { Box } from "ink";
import { executeCliCommand } from "../../store";
import { usePrompt } from "../../hooks/usePrompt";
import { useAppDispatch } from "../../hooks/redux";
import { PromptInputRow } from "../molecules/PromptInputRow";
import { PromptSuggestionRow } from "../molecules/PromptSuggestionRow";

export function InteractiveCommandPrompt() {
  const dispatch = useAppDispatch();
  const { query, inputKey, availableOptions, suggestionIndex, onQueryChange, flushPrompt } =
    usePrompt();

  const handleSubmit = (raw: string) => {
    const cmd = flushPrompt(raw);
    void dispatch(executeCliCommand(cmd));
  };

  return (
    <Box flexDirection="column">
      <PromptSuggestionRow options={availableOptions} activeIndex={suggestionIndex} />
      <PromptInputRow
        inputKey={inputKey}
        value={query}
        onChange={onQueryChange}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}

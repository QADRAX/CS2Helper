import { useMemo } from "react";
import { useInput } from "ink";
import { COMMAND_TREE } from "../lib/commandTree";
import { parsePromptContext } from "../lib/promptContext";
import {
  promptInputKeyBumped,
  promptPatched,
  promptReset,
  selectPromptState,
} from "../store";
import { useAppDispatch, useAppSelector } from "./redux";

export interface UsePromptResult {
  query: string;
  inputKey: number;
  availableOptions: string[];
  suggestionIndex: number;
  onQueryChange: (value: string) => void;
  /** Trims input, clears prompt state in Redux, returns the command string. */
  flushPrompt: (raw: string) => string;
}

export function usePrompt(): UsePromptResult {
  const dispatch = useAppDispatch();
  const prompt = useAppSelector(selectPromptState);
  const { query, suggestionIndex, lastBaseQuery, inputKey } = prompt;

  const { context, filter } = useMemo(() => parsePromptContext(query), [query]);

  const availableOptions = useMemo(() => {
    const opts = COMMAND_TREE[context] ?? [];
    return opts.filter((opt) =>
      opt.startsWith(suggestionIndex === -1 ? filter : lastBaseQuery)
    );
  }, [context, filter, suggestionIndex, lastBaseQuery]);

  useInput((_input, key) => {
    if (key.upArrow || key.downArrow) {
      if (availableOptions.length === 0) return;

      let newIndex = suggestionIndex;
      if (key.upArrow) {
        newIndex = suggestionIndex === -1 ? 0 : (suggestionIndex + 1) % availableOptions.length;
      } else {
        newIndex = suggestionIndex <= 0 ? availableOptions.length - 1 : suggestionIndex - 1;
      }

      if (suggestionIndex === -1) {
        dispatch(promptPatched({ lastBaseQuery: filter }));
      }

      dispatch(promptPatched({ suggestionIndex: newIndex }));

      const selected = availableOptions[newIndex];
      if (selected) {
        const prefix = context ? `${context} ` : "";
        dispatch(promptPatched({ query: prefix + selected }));
        dispatch(promptInputKeyBumped());
      }
    }

    if (key.return) {
      dispatch(promptPatched({ suggestionIndex: -1, lastBaseQuery: "" }));
    }
  });

  const onQueryChange = (value: string) => {
    dispatch(promptPatched({ query: value, suggestionIndex: -1, lastBaseQuery: "" }));
  };

  const flushPrompt = (raw: string) => {
    const trimmed = raw.trim();
    dispatch(promptReset());
    return trimmed;
  };

  return {
    query,
    inputKey,
    availableOptions,
    suggestionIndex,
    onQueryChange,
    flushPrompt,
  };
}

/** Tab-completion branches for the interactive prompt (context key → next tokens). */
export const COMMAND_TREE: Record<string, string[]> = {
  "": ["start", "stop", "record", "config", "exit"],
  record: ["start", "stop"],
  config: ["set"],
  "config set": ["port"],
};

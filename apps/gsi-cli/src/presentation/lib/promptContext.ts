export interface PromptContextParts {
  context: string;
  filter: string;
  parts: string[];
}

export function parsePromptContext(query: string): PromptContextParts {
  const p = query.split(" ");
  const lastPart = p[p.length - 1] ?? "";
  const isAfterSpace = query.endsWith(" ") && query.length > 0;

  if (isAfterSpace) {
    return {
      context: query.trim(),
      filter: "",
      parts: p.filter((x) => x !== ""),
    };
  }

  return {
    context: p.slice(0, -1).join(" ").trim(),
    filter: lastPart,
    parts: p.slice(0, -1).filter((x) => x !== ""),
  };
}

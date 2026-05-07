import { Text } from "ink";
import { MenuOptionLine } from "../atoms/MenuOptionLine";
import type { CliNavEntry } from "../types";

interface NavOptionListProps<T extends string> {
  title: string;
  entries: readonly CliNavEntry<T>[];
  focusedIndex: number;
  hint?: string;
}

export function NavOptionList<T extends string>({ title, entries, focusedIndex, hint }: NavOptionListProps<T>) {
  return (
    <>
      <Text bold>{title}</Text>
      {entries.map((entry, index) => (
        <MenuOptionLine key={entry.id} label={entry.label} focused={index === focusedIndex} />
      ))}
      {hint ? <Text color="gray">{hint}</Text> : null}
    </>
  );
}

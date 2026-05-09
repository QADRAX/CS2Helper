import { Box, Text } from "ink";

export interface HotkeyTabDescriptor {
  /** Single character or key label shown in brackets, e.g. `7`. */
  hotkey: string;
  label: string;
}

export interface HotkeyTabStripProps {
  tabs: readonly HotkeyTabDescriptor[];
  activeIndex: number;
  /** Optional dim hint row under the tab labels. */
  hint?: string;
}

/** Horizontal strip of hotkey-labelled tabs (Ink, no input handling). */
export function HotkeyTabStrip({ tabs, activeIndex, hint }: HotkeyTabStripProps) {
  return (
    <Box marginTop={1} flexDirection="column">
      <Box flexDirection="row" gap={2}>
        {tabs.map((tab, index) => (
          <Text key={`${tab.hotkey}-${tab.label}`} color={activeIndex === index ? "cyan" : "gray"}>
            {activeIndex === index ? "▸ " : "  "}[{tab.hotkey}] {tab.label}
          </Text>
        ))}
      </Box>
      {hint ? <Text dimColor>{hint}</Text> : null}
    </Box>
  );
}

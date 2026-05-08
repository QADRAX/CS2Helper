import { Text } from "ink";

interface MenuOptionLineProps {
  label: string;
  focused: boolean;
}

export function MenuOptionLine({ label, focused }: MenuOptionLineProps) {
  return (
    <Text color={focused ? "cyan" : undefined} bold={focused}>
      {focused ? ">" : " "} {label}
    </Text>
  );
}

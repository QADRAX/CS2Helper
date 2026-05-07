import { Text } from "ink";

interface MenuOptionLineProps {
  label: string;
  focused: boolean;
  activeColor?: "cyan" | "green" | "yellow";
}

export function MenuOptionLine({ label, focused, activeColor = "cyan" }: MenuOptionLineProps) {
  return (
    <Text color={focused ? activeColor : undefined} bold={focused}>
      {focused ? ">" : " "} {label}
    </Text>
  );
}

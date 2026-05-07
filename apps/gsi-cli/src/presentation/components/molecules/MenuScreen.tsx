import { Text } from "ink";
import { MenuOptionLine } from "../atoms/MenuOptionLine";
import type { MenuOption } from "../types";

interface MenuScreenProps {
  menuOptions: MenuOption[];
  menuIndex: number;
}

export function MenuScreen({ menuOptions, menuIndex }: MenuScreenProps) {
  return (
    <>
      <Text bold>Menu</Text>
      {menuOptions.map((option, index) => (
        <MenuOptionLine key={option} label={option} focused={index === menuIndex} />
      ))}
      <Text color="gray">Use Up/Down + Enter</Text>
    </>
  );
}

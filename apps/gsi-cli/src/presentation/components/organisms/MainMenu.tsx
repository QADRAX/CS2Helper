import { MENU_OPTION_LABELS } from "../types";
import { NavOptionList } from "../molecules/NavOptionList";
import { selectInteractiveMenuIndex, selectMainMenuOptions } from "../../store";
import { useAppSelector } from "../../hooks/redux";

export function MainMenu() {
  const menuOptions = useAppSelector(selectMainMenuOptions);
  const menuIndex = useAppSelector(selectInteractiveMenuIndex);
  const entries = menuOptions.map((option) => ({
    id: option,
    label: MENU_OPTION_LABELS[option],
  }));
  return <NavOptionList title="Menu" entries={entries} focusedIndex={menuIndex} hint="Use Up/Down + Enter" />;
}

import { menuOptionToMessageKey } from "../types";
import { NavOptionList } from "../molecules/NavOptionList";
import { selectInteractiveMenuIndex, selectMainMenuOptions } from "../../store";
import { useAppSelector } from "../../hooks/redux";
import { msgKeys } from "../../i18n/msgKeys";
import { useTranslation } from "../../i18n/useTranslation";

export function MainMenu() {
  const menuOptions = useAppSelector(selectMainMenuOptions);
  const menuIndex = useAppSelector(selectInteractiveMenuIndex);
  const { t } = useTranslation();
  const entries = menuOptions.map((option) => ({
    id: option,
    label: t(menuOptionToMessageKey(option)),
  }));
  return (
    <NavOptionList
      title={t(msgKeys.cli.menu.title)}
      entries={entries}
      focusedIndex={menuIndex}
      hint={t(msgKeys.cli.menu.hint)}
    />
  );
}

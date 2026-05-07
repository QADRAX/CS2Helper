import { Box, Text } from "ink";
import { menuOptionToMessageKey } from "../types";
import { selectInteractiveMenuIndex, selectMainMenuOptions } from "../../store";
import { useAppSelector } from "../../hooks/redux";
import { msgKeys } from "../../i18n/msgKeys";
import { useTranslation } from "../../i18n/useTranslation";
import { MenuFootnote } from "../atoms/MenuFootnote";

export function MainMenu() {
  const menuOptions = useAppSelector(selectMainMenuOptions);
  const menuIndex = useAppSelector(selectInteractiveMenuIndex);
  const { t } = useTranslation();

  return (
    <Box flexDirection="column" width="100%">
      {/* Sin paddingX: misma columna interior que CliSectionDivider del shell encima */}
      <Box flexDirection="row" flexWrap="wrap">
        {menuOptions.map((option, index) => {
          const label = t(menuOptionToMessageKey(option));
          const focused = index === menuIndex;
          return (
            <Box key={option} flexDirection="row" flexShrink={0}>
              <Text dimColor>{index === 0 ? "" : " | "}</Text>
              <Text bold={focused} color={focused ? "cyan" : undefined}>
                {focused ? "> " : "  "}
                {label}
              </Text>
            </Box>
          );
        })}
      </Box>
      <MenuFootnote>{t(msgKeys.cli.menu.hint)}</MenuFootnote>
    </Box>
  );
}

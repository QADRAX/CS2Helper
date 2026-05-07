import { Box, Text } from "ink";
import { MenuHeading } from "../atoms/MenuHeading";
import { msgKeys } from "../../i18n/msgKeys";
import { useTranslation } from "../../i18n/useTranslation";

export function ExitConfirm() {
  const { t } = useTranslation();
  return (
    <>
      <MenuHeading title={t(msgKeys.cli.exit.title)} color="yellow" />
      <Box paddingX={1}>
        <Text color="gray">{t(msgKeys.cli.exit.hint)}</Text>
      </Box>
    </>
  );
}

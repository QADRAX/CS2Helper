import { Text } from "ink";
import { msgKeys } from "../../i18n/msgKeys";
import { useTranslation } from "../../i18n/useTranslation";

export function ExitConfirm() {
  const { t } = useTranslation();
  return (
    <>
      <Text bold color="yellow">
        {t(msgKeys.cli.exit.title)}
      </Text>
      <Text>{t(msgKeys.cli.exit.hint)}</Text>
    </>
  );
}

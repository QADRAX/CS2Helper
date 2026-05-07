import { Text } from "ink";
import { msgKeys } from "../../i18n/msgKeys";
import { useTranslation } from "../../i18n/useTranslation";

interface ErrorMessageLineProps {
  message: string;
}

export function ErrorMessageLine({ message }: ErrorMessageLineProps) {
  const { t } = useTranslation();
  return (
    <Text color="red">
      {t(msgKeys.cli.error.linePrefix)} {message}
    </Text>
  );
}

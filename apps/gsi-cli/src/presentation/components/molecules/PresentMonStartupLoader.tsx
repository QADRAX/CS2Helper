import { Box, Text } from "ink";
import type { MessageKey } from "../../i18n/msgKeys";
import { msgKeys } from "../../i18n/msgKeys";
import { useTranslation } from "../../i18n/useTranslation";

interface PresentMonStartupLoaderProps {
  stepKey?: MessageKey;
}

export function PresentMonStartupLoader({ stepKey }: PresentMonStartupLoaderProps) {
  const { t } = useTranslation();
  return (
    <Box flexDirection="column" padding={1} width="100%">
      <Text bold color="cyan">
        {t(msgKeys.cli.presentMon.loader.title)}
      </Text>
      {stepKey ? <Text dimColor>{t(stepKey)}</Text> : <Text dimColor>…</Text>}
    </Box>
  );
}

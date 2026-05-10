import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { MenuFootnote } from "../atoms/MenuFootnote";
import { MenuHeading } from "../atoms/MenuHeading";
import { MenuOptionLine } from "../atoms/MenuOptionLine";
import {
  configDraftPatched,
  selectInteractiveConfigCursor,
  selectInteractiveConfigDraft,
} from "../../store";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { msgKeys } from "../../i18n/msgKeys";
import { useTranslation } from "../../i18n/useTranslation";

export function ConfigEditor() {
  const dispatch = useAppDispatch();
  const configCursor = useAppSelector(selectInteractiveConfigCursor);
  const draft = useAppSelector(selectInteractiveConfigDraft);
  const { t } = useTranslation();

  const localeLabel = `${draft.locale === "en" ? t(msgKeys.cli.config.localeEn) : t(msgKeys.cli.config.localeEs)}`;

  return (
    <>
      <MenuHeading title={t(msgKeys.cli.config.title)} />
      <Box flexDirection="column" paddingX={1}>
        <MenuOptionLine label={t(msgKeys.cli.config.port)} focused={configCursor === 0} />
        <Box marginLeft={2}>
          <TextInput
            value={draft.port}
            onChange={(value) => dispatch(configDraftPatched({ port: value }))}
            placeholder="27015"
            focus={configCursor === 0}
          />
        </Box>
        <MenuOptionLine label={t(msgKeys.cli.config.throttle)} focused={configCursor === 1} />
        <Box marginLeft={2}>
          <TextInput
            value={draft.gsiThrottleSec}
            onChange={(value) => dispatch(configDraftPatched({ gsiThrottleSec: value }))}
            placeholder="0.1"
            focus={configCursor === 1}
          />
        </Box>
        <MenuOptionLine label={t(msgKeys.cli.config.heartbeat)} focused={configCursor === 2} />
        <Box marginLeft={2}>
          <TextInput
            value={draft.gsiHeartbeatSec}
            onChange={(value) => dispatch(configDraftPatched({ gsiHeartbeatSec: value }))}
            placeholder="10"
            focus={configCursor === 2}
          />
        </Box>
        <MenuOptionLine label={`${t(msgKeys.cli.config.locale)} ${localeLabel}`} focused={configCursor === 3} />
        <MenuOptionLine
          label={`${t(msgKeys.cli.config.autoRecord)} ${draft.autoRecordClientTicksOnStart ? t(msgKeys.cli.config.true) : t(msgKeys.cli.config.false)}`}
          focused={configCursor === 4}
        />
        <MenuOptionLine
          label={`${t(msgKeys.cli.config.scoreboardHotkey)} ${draft.scoreboardSnapshotEnabled ? t(msgKeys.cli.config.true) : t(msgKeys.cli.config.false)}`}
          focused={configCursor === 5}
        />
        <MenuOptionLine label={t(msgKeys.cli.config.scoreboardVk)} focused={configCursor === 6} />
        <Box marginLeft={2}>
          <TextInput
            value={draft.scoreboardHotkeyVirtualKey}
            onChange={(value) => dispatch(configDraftPatched({ scoreboardHotkeyVirtualKey: value }))}
            placeholder="88"
            focus={configCursor === 6}
          />
        </Box>
        <MenuOptionLine
          label={`${t(msgKeys.cli.config.scoreboardRequireLive)} ${draft.scoreboardRequireLivePhase ? t(msgKeys.cli.config.true) : t(msgKeys.cli.config.false)}`}
          focused={configCursor === 7}
        />
        <Box flexDirection="column" marginTop={1}>
          <MenuOptionLine label={t(msgKeys.cli.config.save)} focused={configCursor === 8} activeColor="green" />
          <MenuOptionLine label={t(msgKeys.cli.config.createCfg)} focused={configCursor === 9} activeColor="cyan" />
          <MenuOptionLine label={t(msgKeys.cli.config.openDataFolder)} focused={configCursor === 10} activeColor="cyan" />
          <MenuOptionLine label={t(msgKeys.cli.config.cancel)} focused={configCursor === 11} activeColor="yellow" />
        </Box>
      </Box>
      <MenuFootnote>{t(msgKeys.cli.config.navHint)}</MenuFootnote>
      <Box paddingX={1}>
        <Text dimColor>{t(msgKeys.cli.config.scoreboardHotkeyHint)}</Text>
      </Box>
    </>
  );
}

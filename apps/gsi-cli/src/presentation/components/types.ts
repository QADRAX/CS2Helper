import type { MessageKey } from "../i18n/msgKeys";
import { msgKeys } from "../i18n/msgKeys";

export type ScreenMode = "menu" | "config" | "exitConfirm";
export type MenuOption = "start" | "stop" | "launch_cs2" | "config" | "exit";

export interface CliNavEntry<T extends string = string> {
  id: T;
  label: string;
}

export function menuOptionToMessageKey(option: MenuOption): MessageKey {
  switch (option) {
    case "start":
      return msgKeys.cli.menu.start;
    case "stop":
      return msgKeys.cli.menu.stop;
    case "launch_cs2":
      return msgKeys.cli.menu.launchCs2;
    case "config":
      return msgKeys.cli.menu.config;
    case "exit":
      return msgKeys.cli.menu.exit;
  }
}

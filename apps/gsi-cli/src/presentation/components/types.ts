export type ScreenMode = "menu" | "config" | "exitConfirm";
export type MenuOption = "start" | "stop" | "launch_cs2" | "config" | "exit";

export interface CliNavEntry<T extends string = string> {
  id: T;
  label: string;
}

export const MENU_OPTION_LABELS: Record<MenuOption, string> = {
  start: "start",
  stop: "stop",
  launch_cs2: "launch cs2",
  config: "config",
  exit: "exit",
};

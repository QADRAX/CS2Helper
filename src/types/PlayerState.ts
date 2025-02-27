import { ObservatorSlotType, PlayerActivityType, Weapon } from "./CSGO";

export type PlayerState = {
  name: string;
  observer_slot: ObservatorSlotType;
  activity: PlayerActivityType;
  weapons: Weapon[];

}

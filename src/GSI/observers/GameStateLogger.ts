import { CSState } from "../../types/CSState";
import { Observer } from "../Observer";

export const gameStateLogger: Observer<CSState> = (state) => {
  console.log('New game state received:', state);
};

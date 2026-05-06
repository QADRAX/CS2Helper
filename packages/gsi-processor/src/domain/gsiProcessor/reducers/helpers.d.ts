import type { MatchData, RoundData } from "../../match/matchTypes";
import type { GsiProcessorState } from "../gsiProcessorTypes";
export declare function cloneState(state: GsiProcessorState): GsiProcessorState;
export declare function findRound(match: MatchData, roundNumber: number): RoundData | undefined;

import { selectCs2PresentChainError } from "../store";
import { useAppSelector } from "./redux";

/** Latest PresentMon / present-chain failure message while CS2 is tracked (undefined if OK or idle). */
export function useCs2PresentChainError(): string | undefined {
  return useAppSelector(selectCs2PresentChainError);
}

import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { AppDispatch } from "../store/appStore";
import type { RootState } from "../store/rootState";

export function useAppDispatch(): AppDispatch {
  return useDispatch<AppDispatch>();
}

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

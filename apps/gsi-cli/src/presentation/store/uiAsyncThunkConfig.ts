import type { ThunkDispatch, UnknownAction } from "redux";
import type { RootState } from "./rootState";
import type { CliThunkExtra } from "./thunkExtra";

export type UiThunkDispatch = ThunkDispatch<RootState, CliThunkExtra, UnknownAction>;

/** Third generic for `createAsyncThunk` (avoids circular imports with `appStore`). */
export interface UiAsyncThunkConfig {
  state: RootState;
  dispatch: UiThunkDispatch;
  extra: CliThunkExtra;
}

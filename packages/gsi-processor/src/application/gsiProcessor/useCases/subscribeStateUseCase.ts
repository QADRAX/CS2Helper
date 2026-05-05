import type {
  CoreEngineUseCaseContext,
  SubscribeStateUseCase,
  UseCaseFactory,
} from "../../../domain/gsiProcessor";

export const createSubscribeStateUseCase: UseCaseFactory<
  SubscribeStateUseCase,
  CoreEngineUseCaseContext
> = ({ state }) => {
  return {
    execute(listener) {
      return state.subscribeState(listener);
    },
  };
};

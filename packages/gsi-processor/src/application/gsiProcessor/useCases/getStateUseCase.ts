import type {
  CoreEngineUseCaseContext,
  GetStateUseCase,
  UseCaseFactory,
} from "../../../domain/gsiProcessor";

export const createGetStateUseCase: UseCaseFactory<
  GetStateUseCase,
  CoreEngineUseCaseContext
> = ({ state }) => {
  return {
    execute() {
      return state.getState();
    },
  };
};

import type {
  GsiProcessorUseCaseContext,
  GetStateUseCase,
  UseCaseFactory,
} from "../../../domain/gsiProcessor";

export const createGetStateUseCase: UseCaseFactory<
  GetStateUseCase,
  GsiProcessorUseCaseContext
> = ({ state }) => {
  return {
    execute() {
      return state.getState();
    },
  };
};

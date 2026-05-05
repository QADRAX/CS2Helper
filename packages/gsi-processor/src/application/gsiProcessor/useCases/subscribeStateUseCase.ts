import type {
  GsiProcessorUseCaseContext,
  SubscribeStateUseCase,
  UseCaseFactory,
} from "../../../domain/gsiProcessor";

export const createSubscribeStateUseCase: UseCaseFactory<
  SubscribeStateUseCase,
  GsiProcessorUseCaseContext
> = ({ state }) => {
  return {
    execute(listener) {
      return state.subscribeState(listener);
    },
  };
};

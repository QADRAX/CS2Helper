import type {
  CoreEngineUseCaseContext,
  SubscribeEventsUseCase,
  UseCaseFactory,
} from "../../../domain/gsiProcessor";

export const createSubscribeEventsUseCase: UseCaseFactory<
  SubscribeEventsUseCase,
  CoreEngineUseCaseContext
> = ({ events }) => {
  return {
    execute(listener) {
      return events.subscribe(listener);
    },
  };
};

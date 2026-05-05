import type {
  GsiProcessorUseCaseContext,
  SubscribeEventsUseCase,
  UseCaseFactory,
} from "../../../domain/gsiProcessor";

export const createSubscribeEventsUseCase: UseCaseFactory<
  SubscribeEventsUseCase,
  GsiProcessorUseCaseContext
> = ({ events }) => {
  return {
    execute(listener) {
      return events.subscribe(listener);
    },
  };
};

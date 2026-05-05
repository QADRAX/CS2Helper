import { processTickDomain } from "../../../domain/gsiProcessor";
import type {
  CoreEngineUseCaseContext,
  ProcessTickUseCase,
  UseCaseFactory,
} from "../../../domain/gsiProcessor";

export const createProcessTickUseCase: UseCaseFactory<
  ProcessTickUseCase,
  CoreEngineUseCaseContext
> = (deps) => {
  return {
    execute(gameState, timestamp = deps.clock.now()) {
      const result = processTickDomain(
        deps.state.getState(),
        deps.memory.getMemory(),
        gameState,
        timestamp
      );
      deps.state.setState(result.state);
      deps.memory.setMemory(result.memory);
      for (const event of result.events) {
        deps.events.publish(event);
      }
    },
  };
};

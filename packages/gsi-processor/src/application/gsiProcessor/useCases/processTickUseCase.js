import { processTickDomain } from "../../../domain/gsiProcessor";
export const createProcessTickUseCase = (deps) => {
    return {
        execute(gameState, timestamp = deps.clock.now()) {
            const result = processTickDomain(deps.state.getState(), deps.memory.getMemory(), gameState, timestamp);
            deps.state.setState(result.state);
            deps.memory.setMemory(result.memory);
            for (const event of result.events) {
                deps.events.publish(event);
            }
        },
    };
};

import { describe, expect, it } from "vitest";
import { createInitialGsiProcessorState } from "../../domain/gsiProcessor";
import { createGetStateUseCase } from "../gsiProcessor/useCases/getStateUseCase";
import { createMockProcessorContext } from "./mockProcessorContext";

describe("createGetStateUseCase", () => {
  it("returns state from state port", () => {
    const context = createMockProcessorContext();
    const useCase = createGetStateUseCase(context);

    const result = useCase.execute();

    expect(context.state.getState).toHaveBeenCalledTimes(1);
    expect(result).toEqual(createInitialGsiProcessorState());
  });
});

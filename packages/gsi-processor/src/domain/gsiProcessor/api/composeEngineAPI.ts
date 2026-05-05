type UseCaseExecutor = {
  execute: (...args: never[]) => unknown;
};

type UseCaseRecord = Record<string, UseCaseExecutor>;

type ApiFromUseCases<TUseCases extends UseCaseRecord> = {
  [K in keyof TUseCases]: TUseCases[K]["execute"];
};

/**
 * Fluent builder used to expose application use cases as a plain API object.
 *
 * Each `add()` call keeps type information so the final `build()` result exposes
 * correctly typed functions instead of generic `execute()` wrappers.
 */
interface EngineAPIComposer<TUseCases extends UseCaseRecord> {
  /** Adds one named use case to the API under construction. */
  add<TKey extends string, TUseCase extends UseCaseExecutor>(
    key: TKey,
    useCase: TUseCase
  ): EngineAPIComposer<TUseCases & Record<TKey, TUseCase>>;
  /** Materializes the public API by binding every `execute()` method. */
  build(): ApiFromUseCases<TUseCases>;
}

/**
 * Creates a fluent API composer for the processor public surface.
 *
 * Infrastructure uses this helper as the final assembly step after all concrete
 * application use cases have already been instantiated.
 */
export function composeEngineAPI<
  TUseCases extends UseCaseRecord = Record<never, never>
>(): EngineAPIComposer<TUseCases> {
  const useCases: UseCaseRecord = {};

  const createComposer = <TCurrent extends UseCaseRecord>(): EngineAPIComposer<TCurrent> => {
    return {
      add(key, useCase) {
        useCases[key] = useCase;
        return createComposer<TCurrent & Record<typeof key, typeof useCase>>();
      },
      build() {
        const apiEntries = Object.entries(useCases).map(([key, useCase]) => {
          return [key, useCase.execute.bind(useCase)];
        });
        return Object.fromEntries(apiEntries) as ApiFromUseCases<TCurrent>;
      },
    };
  };

  return createComposer<TUseCases>();
}

import { Draft, produce } from 'immer';
import { createObservable, Observable } from './Observable';
import { Observer } from './Observer';

export interface StateContainer<T> {
  get: () => Readonly<T>;
  update: (updater: (draft: Draft<T>) => void) => void;
  subscribe: (observer: Observer<Readonly<T>>) => () => void; // Función para desuscribirse.
}

export function createStateContainer<T>(initialState: T): StateContainer<T> {
  let state: Readonly<T> = Object.freeze(initialState);
  const observable: Observable<Readonly<T>> = createObservable<Readonly<T>>();

  const subscribe = (observer: Observer<Readonly<T>>) => {
    observable.subscribe(observer);
    return () => observable.unsubscribe(observer);
  };

  return {
    get: () => state,
    update: (updater: (draft: Draft<T>) => void) => {
      state = produce(state, updater);
      observable.notify(state);
    },
    subscribe,
  };
}

export function updateIfExists<T>(
  container: StateContainer<T | null>,
  updater: (draft: Draft<T>) => void,
): void {
  container.update((state) => {
    if (state === null) return state;
    updater(state);
    return state;
  });
}

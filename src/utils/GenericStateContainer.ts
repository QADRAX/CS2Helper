import { createObservable, Observable } from './Observable';
import { Observer } from './Observer';

export interface StateContainer<T> {
  get: () => Readonly<T>;
  update: (updater: (current: Readonly<T>) => T) => void;
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
    update: (updater: (current: Readonly<T>) => T) => {
      const newState = updater(state);
      state = Object.freeze(newState);
      observable.notify(state);
    },
    subscribe,
  };
}

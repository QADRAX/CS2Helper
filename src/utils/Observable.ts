import { Observer } from "./Observer";

export type Observable<T> = {
  subscribe: (observer: Observer<T>) => void;
  unsubscribe: (observer: Observer<T>) => void;
  notify: (state: T) => void;
  getLastState: () => T | null;
};

export function createObservable<T>(): Observable<T> {
  let observers: Observer<T>[] = [];
  let lastState: T | null = null;

  return {
    subscribe(observer: Observer<T>) {
      observers = [...observers, observer];
    },

    unsubscribe(observer: Observer<T>) {
      observers = observers.filter((obs) => obs !== observer);
    },

    notify(state: T) {
      lastState = state;
      observers.forEach((observer) => observer(state));
    },

    getLastState() {
      return lastState;
    }
  };
}

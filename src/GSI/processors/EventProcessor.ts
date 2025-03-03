export type EventProcessor<T> = (state: T, timestamp: number) => void;

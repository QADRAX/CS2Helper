/** Clock abstraction to inject deterministic timestamps in tests. */
export interface ClockPort {
  now: () => number;
}

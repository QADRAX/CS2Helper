import type { PresentFrameSample } from "./presentChain";

const DEFAULT_WINDOW = 32;

/**
 * Updates a rolling buffer of frametimes (ms) and returns a copy of `sample` with
 * `fpsSmoothed` when enough data exists. **Mutates** `frametimesMs`.
 */
export function appendPresentMonFpsSmoothing(
  sample: PresentFrameSample,
  frametimesMs: number[],
  windowSize: number = DEFAULT_WINDOW
): PresentFrameSample {
  const ms = sample.frametimeMs;
  if (ms !== undefined && ms > 0.0001) {
    frametimesMs.push(ms);
    if (frametimesMs.length > windowSize) {
      frametimesMs.shift();
    }
    const avgMs = frametimesMs.reduce((a, b) => a + b, 0) / frametimesMs.length;
    if (avgMs > 0.0001) {
      return { ...sample, fpsSmoothed: 1000 / avgMs };
    }
  }
  return sample;
}

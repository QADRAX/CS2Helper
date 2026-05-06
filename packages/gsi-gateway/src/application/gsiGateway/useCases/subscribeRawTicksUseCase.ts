export const subscribeRawTicks = (
  rawTickListeners: Set<(raw: string) => void>,
  listener: (raw: string) => void
) => {
  rawTickListeners.add(listener);
  return () => {
    rawTickListeners.delete(listener);
  };
};

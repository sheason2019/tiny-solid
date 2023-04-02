import createEffect from "./effect";
import { createSignal } from "./signal";

export function createMemo<T extends any>(fn: () => T) {
  const [signal, setSignal] = createSignal<T | undefined>(undefined);

  createEffect(() => {
    setSignal(fn());
  });

  return signal;
}

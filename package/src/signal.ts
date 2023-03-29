import { REACT_SCOPE } from "./react-scope";

export function createSignal<T extends any>(initValue: T) {
  let value = initValue;

  const depCollection: Set<any> = new Set();

  const getter = () => {
    const dep = REACT_SCOPE.Listener;
    if (dep) {
      depCollection.add(dep);
    }

    return value;
  };
  const setter = (next: T) => {
    value = next;
    depCollection.forEach((v) => {
      v();
    });
  };
  return [getter, setter] as [() => T, (value: T) => void];
}

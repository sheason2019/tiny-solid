import { REACT_SCOPE } from "./react-scope";

export function createSignal<T extends any>(initValue: T) {
  let value = initValue;

  const depCollection: Set<any> = new Set();

  const getter = () => {
    const dep = REACT_SCOPE.Listener;
    console.log("add dep", dep);
    depCollection.add(dep);

    return value;
  };
  const setter = (next: T) => {
    depCollection.forEach((v) => {
      console.log("effect dep:", v);
    });
    value = next;
  };
  return [getter, setter] as [() => T, (value: T) => void];
}

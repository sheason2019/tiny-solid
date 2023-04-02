import { REACT_SCOPE } from "./react-scope";

export function createEffect(fn: () => any) {
  const temp = REACT_SCOPE.Listener;
  REACT_SCOPE.Listener = fn;
  fn();
  REACT_SCOPE.Listener = temp;
}

export default createEffect;

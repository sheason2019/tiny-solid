import { h, createSignal } from "tiny-solid";

const App = () => {
  const [count, setCount] = createSignal<number>(0);

  return (
    <div>
      <div>{count()}</div>
      <button onClick={() => setCount(count() + 1)}>increment</button>
    </div>
  );
};

h(<App />, document.getElementById("app")!);

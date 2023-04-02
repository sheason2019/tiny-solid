import { h, createSignal, createMemo, createEffect } from "tiny-solid";

const App = () => {
  const [count, setCount] = createSignal<number>(0);

  const doubleCount = createMemo(() => count() * 2);

  createEffect(() => {
    console.log("count is changed:", count());
  });

  return (
    <div>
      <div>{() => count()}</div>
      <button onclick={() => () => setCount(count() + 1)}>increment</button>
      <div>
        double count <span>{() => doubleCount()}</span>
      </div>
    </div>
  );
};

h(<App />, document.getElementById("app")!);

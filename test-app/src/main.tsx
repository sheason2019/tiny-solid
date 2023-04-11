import { h, createSignal, createMemo, createEffect } from "tiny-solid";

import "./main.css";

const [count, setCount] = createSignal<number>(0);

const App = () => {
  const doubleCount = createMemo(() => count() * 2);

  createEffect(() => {
    console.log("count is changed:", count());
  });

  return (
    <div class="root-container">
      <div class="h1">Counter Example</div>
      <CounterShower />
      <button class="button" onclick={() => () => setCount(count() + 1)}>
        Count++
      </button>
      <div class="double-count">
        double count <span>{() => doubleCount()}</span>
      </div>
    </div>
  );
};

const CounterShower = () => {
  return (
    <div class="counter-shower">
      <span>跨组件响应性示例：</span>
      <span>{() => count()}</span>
    </div>
  );
};

h(<App />, document.getElementById("app")!);

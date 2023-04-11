# 技术分享：JSX、Signal 与 Solidjs

# JSX 的推动者和 JSX 的影响力

在前端开发领域，有三个极具影响力的框架，它们分别是：React、Vue 和 Angular。

Angular 是一个对服务端开发者相对友好的框架，在 Angular 中，Java 开发者会见到许多非常熟悉的概念，如装饰器 Decorator（在 Java 中被称作注解 Annotation）、依赖注入、MVC 架构等，尽管它后续发展的势头保持的不如另外两个竞争者，但 Angular 对前端开发领域的影响力依旧是毋庸置疑的。

Vue 在前端开发领域的名声可谓是耳熟能详，在最初，Vue 经常被认为是一款经过简化的 Angular，但随着时间的迁移，Vue 也慢慢发展出了自己独树一帜的风格，而在单文件组件（SFC）的概念推出以后，Vue 基本就挥手告别了自己所谓“前端框架集大成者”的身份，摇身一变成为了模板编译型前端框架的代言人。

而 React 则是这三大框架中相对成熟的一款框架，它自诞生之初就喊着`f(state) = UI`的口号，在前端开发中引入了函数式编程、单向数据流、V-DOM 等时至今日都耳熟能详的概念，而最重要的是，它将 JSX 开发范式推而广之，打破了传统 UI 开发中“关注点分离”的铁律，让大家逐渐接受了这种“在代码中编写界面”的开发方式。

更令人惊叹的是，JSX 对 Web 以外的前端开发领域同样造成了不小的冲击，较为知名的有以下几个：

- Kotlin 的 Jetpack Compose

- 最知名的跨端解决方案 Flutter

- 正在火急火燎模仿 Flutter 但暂时难产的 dotnet 体系下的 MAUI in MVU

- 以及 React 自家的 React-Native

但上面的内容并不是本次技术分享的重点。

如果大家还有印象，在 2022 年，前端开发领域出现了两名可以被称为超新星的框架，它们分别是 Solid.js 和 Svelte。

而今天的主题就是分享 Solid.js 这个框架实现响应性的秘诀，同时仿造 Solid.js 实现一个简易的响应性 JSX Demo。

# Solid.js 与 Signals

众所周知，React 是一个处处都是魔法的框架。

在 React 的早期版本，它就因为 Rerender 的问题而为人诟病，而当它在后续迭代的版本中接连引入 Hooks、Fiber、Suspense 等概念之后，它所隐含的心智负担更是年年都在以指数级别上升，如果不考虑 React Native，仅从 Web 的角度来检视 React，我们会发现一个有趣的问题：那就是 React 所引入的所有心智负担，基本都是在为 V-DOM 的设计买单。

那么，有没有办法在保留 React 开发体验的前提下，去除掉这令人头疼的 V-DOM 呢？Solid.js 给出的答案是可以。

去年有很多文章剖析过 Solid.js 的内部原理，可以说，它最为关键的一个点就是使用 Signals 作为响应性基础。

我们可以思考一下，为什么 React 需要 V-DOM？答案是当组件内的状态发生变化时，React 需要通过比对 V-DOM 才能得知接下来序号进行哪些原生操作，可以说，V-DOM 就是 React 的响应性基础。

而 Solid.js 的创新之处在于，它使用了 Signal 作为响应性基础，Signal 可以简单的理解为 React 框架中的 useState Hook，不同的是，它所返回的值是`[getter, setter]`两个函数，而不是 React 风格的`[value, setter]`，这种设计允许程序在特定的生命周期执行`getter`函数时，将需要保持响应性的部分收集到 Signal 的订阅者集合中，当这个 Signal 完成更新以后，Signal 会将新的值通知给所有需要进行响应的订阅者，从而实现程序的响应性。

虽然理论上很简单，但要实现这个响应性却并不轻松，举个例子，假如有以下 JSX 代码：

```jsx
const CompA = () => {
  const [value, setValue] = createSignal(0);
  return <div>{value}</div>;
};
```

React 编译出来的 JavaScript 产物可能是这样的：

```jsx
const CompA = () => {
  const [value, setValue] = createSignal(0);
  return _jsx("div", { children: value });
};
```

但 Solid 编译出来的 JavaScript 产物必须是这样的：

```jsx
const CompA = () => {
  const [value, setValue] = createSignal(0);
  return _jsx("div", { children: () => value });
};
```

可以注意到，Solid.js 会在编译阶段将 JSX 中赋给标签的属性从值变为函数，这其实是 Solid.js 响应性实现中的一个弊端。

粗略的说，Solid.js 的 Runtime 可以分为两个阶段，第一阶段我们就把它称为 Tree Building 好了，在这一阶段，Solid.js 会从用户指定的一个入口开始（如上面的 CompA），构建出一个完整的 DOM 树，并在此期间自动收集和构建响应性依赖（也就是初始化各个 Signal 的订阅者）；第二阶段则可以看做是程序的 Running 阶段，这一阶段 Solid.js 只会对第一阶段构建的发布订阅模型进行维护，而不会像 React 一样对整个组件进行重渲染。

还是拿上面的 CompA 举例，当在 Solid 中触发了 setValue 逻辑时，Solid 会运行的不是整个 CompA 函数，而是编译后产生的`() => value`函数，并在完成计算后直接在原生 DOM 上对发生了变化的属性进行修改。

可以说，整个`_jsx`和`createSignal`函数可以简单看成以下形式：

```typescript
let Listener: () => any | null = null;
function _jsx(tag: string, props: Record<string, () => any>) {
  const el = document.createElement(tag);
  props.forEach((prop) => {
    const temp = Listener;
    // 直接操作原生DOM的函数会被写入Listener中
    Listener = () => {
      // 传入props的值要到这个阶段才惰性求值
      el.setAttribute(prop, props[prop]());
    };
    // 初次执行
    Listener();
    Listener = temp;
  });
}

function createSignal(init: any) {
  const s = {
    val: init,
    listener: [],
  };

  const getter = () => {
    if (Listener !== null) {
      s.listener.add(Listener);
    }
    return s.val;
  };

  const setter = (val: any) => {
    s.val = val;
    s.listener.forEach((lis) => lis(val));
  };

  return [getter, setter];
}
```

得知了这些信息，我们就可以知道为什么 Solid 需要将属性值编译成函数了：因为 JavaScript（或者说绝大多数编程语言）在执行嵌套函数的时候（如`A(B(), D())`），会优先计算参数的值，如果我们不将赋予属性的值转换为函数，那么，在我们将 Listener 指针转换到正确的对象之前，getter 函数就会提前执行完毕，那么自动收集依赖并实现响应性的目标肯定也就无法实现了。

# Typescript 对于 JSX 的支持

在描述完 Solid.js 的原理后，我们需要再回到 JSX 这个话题上，为什么 JSX 能够逐步变成一个能被广泛认可的开发范式？我想在无数的理由中，一定有一条是 TypeScript 为它提供了良好的支持。

在 TypeScript 中使用 JSX 还是比较轻松的，只需要在 jsx-runtime.d.ts 中导出诸如此类的内容，就可以自定义出任何自己想要的标签，以及类型提示：

```typescript
export namespace JSX {
  interface IntrinsicElements {
    div: any;
    button: any;
    span: any;
  }
}
```

同时，Typescript 还为 JSX 提供了基础的编译能力，只需要在`tsconfig.json`文件中添加`compileOptions`属性：`"jsx": "rect-jsx"`，在执行 tsc 命令时，Typescript 就会自动将 TSX 编译成 JavaScript，而无需使用 Babel 来转译 JSX 文件。

# 如何实现基于 JSX、Signals 和 Typescript 的响应式框架

上面的内容比较笼统和发散，而在接下来的阶段，我们需要把注意力集中到一个问题上：如何实现一个类似 Solid.js 的 JSX 框架？

通过前文累积的线索，我们可以把这个问题分解成两个主要的部分：

1. 实现 JSX

2. 实现 Signals 响应性

## 如何实现 JSX

在 Typescript 中，如果想要自定义具有类型提示的 TSX，则需要对 tsconfig 文件中的`jsx`属性和`jsxImportSource`属性进行配置，当开发者启用 JSX 并指定 `jsxImportSource` 属性后，TypeScript 会在 `jsxImportSource` 指定的依赖目录下寻找 `jsx-runtime.d.ts` 文件，并引用其中的 `jsx.IntrinsicElements` 类型作为 TSX 标签的类型声明。

完成这一工作后，我们就已经可以在项目中进行基础的 JSX 编程，但在这一阶段，JSX 还无法被正确编译为 DOM，因为我们还没有编写 JSX 的处理函数。

在该项目下的`package/jsx-runtime/index.ts`中，程序导出了一个`jsx`函数，Typescript 对 TSX 编译的产物会引用这个函数，以处理开发者编写的 TSX 标签，这一函数会将开发者编写的 TSX 标签转换为 DOM 树，到这一阶段，基本就已经实现了一个简单的 JSX。

但通常的前端框架（如 React）还会提供一个组件的挂载函数，如 React.createRoot，我们这里也实现一个简单的 h 函数实现组件的挂载：

```ts
export const h = (el: Element, mountEl: Element) => {
  mountEl?.replaceChildren(el);
};
```

这样 JSX 就完成了。

## 如何实现 Signals 响应性

在前面的分享中其实已经提及到了 Signals 的原理，Signals 的响应性主要是通过一个由指针实现的栈进行自动化依赖收集实现的，只要把握好这个方向，我们可以很快编写出类似于 React 中 State hook 和 Effect hook 的两种主要的原语。

代码可见`package/signal.ts`和`package/effect.ts`。

基于这两个原语，我们可以很容易的实现出近似`useMemo`的 hook，代码可见`package/memo.ts`。

这样一来，基本的 Signals 响应性设计也可以算告一段落了。

## 成果

基于上面完成的内容，我使用 Vite 启动了一个原生 Typescript 应用，并在`src/main.tsx`下编写了一个基础的 Counter 页面。

以上就是本次技术分享的全部内容。

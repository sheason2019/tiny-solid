export namespace JSX {
  interface ElementBase {
    class?: string;
  }

  interface HTMLDivElement extends ElementBase {
    children?: any;
  }
  interface HTMLButtonElement extends ElementBase {
    onclick?: () => () => any;
  }
  interface HTMLSpanElement extends ElementBase {}

  interface IntrinsicElements {
    div: HTMLDivElement;
    button: HTMLButtonElement;
    span: HTMLSpanElement;
  }
}

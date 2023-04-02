import { Component } from "./type";

export const h = (el: Element, mountEl: Element) => {
  mountEl?.replaceChildren(el);
};

export const Fragment = () => {};

export { createSignal } from "./signal";
export { createEffect } from "./effect";
export { createMemo } from "./memo";

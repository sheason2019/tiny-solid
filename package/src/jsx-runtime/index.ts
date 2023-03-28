import { REACT_SCOPE } from "../react-scope";

export type Component = () => Element;

export interface Props {
  children: Component | string | number;
  [T: string]: any;
}

export const jsx = (tag: string | Component, props: Props): Element => {
  if (typeof tag === "function") {
    return tag();
  } else {
    const el = document.createElement(tag);

    Object.keys(props).forEach((key) => {
      const attrSetter = function (this: any) {
        console.log("setter this", this);
        el.setAttribute(key, props[key]);
      };
      REACT_SCOPE.Listener = attrSetter;
      attrSetter();
    });

    return el;
  }
};

export const jsxDEV = jsx;

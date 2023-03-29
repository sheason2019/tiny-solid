import { REACT_SCOPE } from "../react-scope";

export type Component = (props?: Props) => Element;

export interface Props {
  children: Component | string | number;
  [T: string]: any;
}

export const jsx = (tag: string | Component, props: Props): Element => {
  if (typeof tag === "function") {
    return tag(props);
  } else {
    const persist: Record<string, any> = {};
    const el = document.createElement(tag);

    Object.keys(props).forEach((key) => {
      const attrSetter = () => {
        let val: any;

        if (typeof props[key] === "function") {
          val = props[key]();
        } else {
          val = props[key];
        }

        if (key === "children") {
          if (Array.isArray(val)) {
            el.replaceChildren(...val);
          } else {
            el.replaceChildren(val);
          }
        } else if (key === "onclick") {
          if (persist["click"]) {
            el.removeEventListener("click", persist["click"]);
          }
          el.addEventListener("click", val);
          persist["click"] = val;
        } else {
          el.setAttribute(key, val);
        }
      };

      REACT_SCOPE.Listener = attrSetter;
      attrSetter();
      REACT_SCOPE.Listener = null;
    });

    return el;
  }
};

const renderComponent = (el: Element, props: Props, key: string) => {
  const attrSetter = () => {
    let val: any;

    if (typeof props[key] === "function") {
      val = props[key]();
    } else {
      val = props[key];
    }

    if (key === "children") {
      el.replaceChildren(val);
    } else if (key === "onclick") {
      el.addEventListener("click", val);
    } else {
      el.setAttribute(key, val);
    }
  };

  REACT_SCOPE.Listener = attrSetter;
  attrSetter();
  REACT_SCOPE.Listener = null;
};

const renderChild = (el: Element, val: any) => {
  if (val instanceof Node) {
    el.appendChild(val);
  } else {
    el.innerHTML += val;
  }
};

export const jsxDEV = jsx;

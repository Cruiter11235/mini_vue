import { createRenderer } from "../runtime-core";

function createElement(type: any) {
  return document.createElement(type);
}

function patchProp(el: HTMLElement, key: any, preValue: any, nextValue: any) {
  //   console.log(nextValue);
  const isOn = (str: string) => {
    return /^on[A-Z]/.test(str);
  };
  if (isOn(key)) {
    el.addEventListener(key.slice(2).toLowerCase(), nextValue);
  } else {
    if (nextValue === null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, nextValue);
    }
  }
}

function insert(el: HTMLElement, container: HTMLElement, anchor?: any) {
  if (anchor) {
    container.insertBefore(el, anchor);
  } else {
    container.append(el);
  }
}

function remove(child: HTMLElement) {
  const parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
}
function setElementText(el: HTMLElement, text: string) {
  el.textContent = text;
}
// init renderer
const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
});

// 导出createApp
export function createApp(...args: any[]) {
  return renderer.createApp(...args);
}

export * from "../runtime-core";

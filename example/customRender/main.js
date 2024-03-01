import { createApp, createRenderer } from "../../lib/guide-mini-vue.esm.js";
import { App } from "./app.js";
const Game = new PIXI.Application({
  width: 500,
  height: 500,
});
const baseContainer = document.querySelector("#app");

document.body.append(Game.view);

function createElement(type) {
  //   console.log(type);
  if (type === "rect") {
    console.log("rect");
    const rect = new PIXI.Graphics();
    rect.beginFill(0xde3249);
    rect.drawRect(0, 0, 100, 100);
    rect.endFill();
    return rect;
  }
  return document.createElement(type);
}
function patchProps(el, key, value) {
  el[key] = value;
  //   const isOn = (key) => /^on[A-Z]/.test(key);
  //   if (isOn(key)) {
  //     const event = key.slice(2).toLowerCase();
  //     el.addEventListener(event, value);
  //   } else {
  //     el.setAttribute(key, value);
  //   }
}
function insert(el, parent) {
  //   parent.add(el);
  parent.addChild(el);
}
const renderer = createRenderer({
  createElement,
  patchProps,
  insert,
});
renderer.createApp(App).mount(Game.stage);

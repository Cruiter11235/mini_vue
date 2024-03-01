import { createApp } from "../../lib/guide-mini-vue.esm.js";
import { App } from "./app.js";
const dom = document.querySelector("#app");
createApp(App).mount(dom);

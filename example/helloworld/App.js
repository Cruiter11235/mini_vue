/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-01 14:28:46
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-03 18:29:32
 * @FilePath: \my_mini_vue\example\helloworld\App.js
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
import { h, createTextVNode } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";
window.self = null;
export const App = {
  name: "App",
  render() {
    window.self = this;
    const app = h("div", {}, this.msg);
    const foo = h(
      Foo,
      {},
      {
        header: (age) => [
          h("div", {}, "header " + age),
          createTextVNode("hello"),
        ],
        footer: (name) => h("div", {}, "footer " + name),
      }
    );
    return h("div", {}, [app, foo]);
  },
  setup() {
    return {
      msg: "mini-vue",
    };
  },
};

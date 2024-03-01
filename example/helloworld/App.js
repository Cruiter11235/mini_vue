/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-01 14:28:46
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-01 21:37:38
 * @FilePath: \my_mini_vue\example\helloworld\App.js
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
import { h } from "../../lib/guide-mini-vue.esm.js";
window.self = null;
export const App = {
  render() {
    window.self = this;
    return h("div", { id: "root", class: ["red", "hard"] }, [
      h("p", { class: "red" }, "hi  " + this.msg),
      h("p", { class: "blue" }, "hello world!"),
    ]);
  },
  setup() {
    return {
      msg: "mini-vue",
    };
  },
};

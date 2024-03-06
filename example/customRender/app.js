/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-06 15:39:59
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-06 15:59:36
 * @FilePath: \my_mini_vue\example\customRender\app.js
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
import { h } from "../../lib/guide-mini-vue.esm.js";
export const App = {
  name: "App",
  setup() {
    let x = 100;
    let y = 100;
    return {
      x,
      y,
    };
  },
  render() {
    return h("rect", { x: this.x, y: this.y });
  },
};

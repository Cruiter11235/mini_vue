/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-01 14:26:41
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-01 14:27:25
 * @FilePath: \my_mini_vue\example\helloworld\main.js
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */

import { createApp } from "../../lib/guide-mini-vue.esm.js";
import {App} from "./App.js";

const rootContainer = document.querySelector("#app");
createApp(App).mount(rootContainer);

/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-01 14:32:52
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-01 17:10:54
 * @FilePath: \my_mini_vue\src\runtime-core\createApp.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
import { createVNode } from "./vnode";
import { render } from "./renderer";
export function createApp(rootComponent: any) {
  return {
    mount(rootContainer: HTMLElement) {
      // 创建虚拟节点
      const vnode = createVNode(rootComponent);
      render(vnode, rootContainer);
    },
  };
}

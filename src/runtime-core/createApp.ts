/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-01 14:32:52
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-06 14:29:43
 * @FilePath: \my_mini_vue\src\runtime-core\createApp.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
import { createVNode } from "./vnode";

export function createAppAPI(render: any) {
  return function createApp(rootComponent: any) {
    return {
      mount(rootContainer: HTMLElement) {
        // 创建虚拟节点
        const vnode = createVNode(rootComponent);
        render(vnode, rootContainer);
      },
    };
  };
}

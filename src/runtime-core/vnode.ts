/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-01 14:36:22
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-01 21:42:39
 * @FilePath: \my_mini_vue\src\runtime-core\vnode.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
export function createVNode(type: any, props?: any, children?: any) {
  const vnode: VNode = { type, props, children, el: null };
  return vnode;
}

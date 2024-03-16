/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-01 17:03:52
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-06 18:22:16
 * @FilePath: \my_mini_vue\src\global.d.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
interface VNode {
  vnode: VNode;
  type: any;
  props?: any;
  children?: any;
  el?: HTMLElement | null | any;
  shapeFlag: number;
  key: any;
  component?: Instance;
}
interface Instance {
  vnode: VNode;
  type: any;
  proxy?: any;
  setupState: any;
  render?: any;
  props: any;
  emit: Function;
  slots?: any;
  parent: any;
  provides: StringKey;
  isMounted: boolean;
  subTree: any;
  update?: any;
  next: VNode | null;
}
interface Context {
  source: string;
}
type StringKey = Record<string, any>;

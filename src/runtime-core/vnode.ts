/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-01 14:36:22
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-03 18:01:38
 * @FilePath: \my_mini_vue\src\runtime-core\vnode.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
import { ShapeFlags } from "./shapeFlags";
export const Fragment = Symbol("fragment");
export const Text = Symbol("text");
export {
  createVNode as createElementVnode
}
export function createVNode(type: any, props: any = {}, children: any = {}) {
  const vnode: VNode = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type),
    key: props && props.key,
  };

  if (typeof children === "string" || typeof children === "number") {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXTCHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAYCHILDREN;
  } else if (vnode.shapeFlag & ShapeFlags.STATEFULCOMPONENT) {
    if (typeof children === "object") {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
    }
  }
  // console.log(vnode.shapeFlag);
  return vnode;
}

function getShapeFlag(type: any): number {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFULCOMPONENT;
}

export function createTextVNode(text: string) {
  return createVNode(Text, {}, text);
}

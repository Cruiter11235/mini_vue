/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-01 14:42:08
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-01 22:28:05
 * @FilePath: \my_mini_vue\src\runtime-core\renderer.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */

import { isObject } from "../reactivity/index";
import { createComponentInstance, setupComponent } from "./component";
export function render(vnode: VNode, container: HTMLElement) {
  // patch
  patch(vnode, container);
}
/**
 * @param vnode
 * @param container
 * @description 挂载
 */
function patch(vnode: VNode, container: HTMLElement) {
  // 去处理组件

  // TODO 判断vnode是不是element
  // processElement();
  console.log(vnode.type);
  if (typeof vnode.type == "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }
}
function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}
// 挂载dom元素
function mountElement(InitialVnode: VNode, container: HTMLElement) {
  // string array
  const el: HTMLElement = (InitialVnode.el = document.createElement(
    InitialVnode.type
  ));
  const { children } = InitialVnode;
  if (typeof children == "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    // 渲染vnode下所有的子节点
    mountChildren(InitialVnode, el);
  }
  const { props } = InitialVnode;
  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }
  container.appendChild(el);
}
/**
 * @description 挂载vnode下所有的子节点
 */
function mountChildren(vnode: VNode, container: HTMLElement) {
  vnode.children?.forEach((childVnode: VNode) => {
    patch(childVnode, container);
  });
}
/**
 * @description 挂载组件
 */
function mountComponent(InitalVnode: any, container: HTMLElement) {
  const instance = createComponentInstance(InitalVnode);
  setupComponent(instance);
  setupRenderEffect(instance, InitalVnode, container);
}

function setupRenderEffect(
  instance: Instance,
  InitialVnode: VNode,
  container: HTMLElement
) {
  const { proxy } = instance;
  // 执行instance.render 但是此时里面的this已经指向proxy
  const subTree = instance.render.call(proxy);
  //   vnode -> patch
  //   vnode -> element

  patch(subTree, container);
  InitialVnode.el = subTree.el;
}

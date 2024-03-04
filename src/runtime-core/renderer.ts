/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-01 14:42:08
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-04 10:25:26
 * @FilePath: \my_mini_vue\src\runtime-core\renderer.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */

import { isObject } from "../reactivity/index";
import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "./shapeFlags";
import { Fragment, Text } from "./vnode";
export function render(vnode: VNode, container: HTMLElement) {
  // patch
  patch(vnode, container, null);
}
/**
 * @param vnode
 * @param container
 * @description 挂载
 */
function patch(vnode: VNode, container: HTMLElement, parentComponent: any) {
  // console.log(parentComponent);
  // 去处理组件

  // TODO 判断vnode是不是element
  // processElement();
  // console.log(vnode.type);
  // console.log(vnode.shapeFlag);
  const { type, shapeFlag } = vnode;
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent);
      } else if (shapeFlag & ShapeFlags.STATEFULCOMPONENT) {
        processComponent(vnode, container, parentComponent);
      }
      break;
  }
}
function processText(vnode: VNode, container: HTMLElement) {
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.appendChild(textNode);
}
function processFragment(
  vnode: VNode,
  container: HTMLElement,
  parentComponent: any
) {
  mountChildren(vnode, container, parentComponent);
}
function processElement(
  vnode: VNode,
  container: HTMLElement,
  parentComponent: any
) {
  mountElement(vnode, container, parentComponent);
}
function processComponent(
  vnode: VNode,
  container: HTMLElement,
  parentComponent: any
) {
  mountComponent(vnode, container, parentComponent);
}
// 挂载dom元素
function mountElement(
  InitialVnode: VNode,
  container: HTMLElement,
  parentComponent: any
) {
  // string array
  const el: HTMLElement = (InitialVnode.el = document.createElement(
    InitialVnode.type
  ));
  const { children, shapeFlag } = InitialVnode;
  if (shapeFlag & ShapeFlags.TEXTCHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAYCHILDREN) {
    // 渲染vnode下所有的子节点
    mountChildren(InitialVnode, el, parentComponent);
  }
  const { props } = InitialVnode;
  // check format
  const isOn = (key: string) => {
    return /^on[A-Z]/.test(key);
  };
  for (const key in props) {
    const val = props[key];
    if (isOn(key)) {
      el.addEventListener(key.slice(2).toLowerCase(), val);
    } else {
      el.setAttribute(key, val);
    }
  }
  container.appendChild(el);
}
/**
 * @description 挂载vnode下所有的子节点
 */
function mountChildren(
  vnode: VNode,
  container: HTMLElement,
  parentComponent: any
) {
  vnode.children?.forEach((childVnode: VNode) => {
    patch(childVnode, container, parentComponent);
  });
}
/**
 * @description 挂载组件
 */
function mountComponent(
  InitalVnode: any,
  container: HTMLElement,
  parentComponent: any
) {
  const instance = createComponentInstance(InitalVnode, parentComponent);
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

  patch(subTree, container, instance);
  InitialVnode.el = subTree.el;
}

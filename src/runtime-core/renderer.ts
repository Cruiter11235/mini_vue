/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-01 14:42:08
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-08 18:21:04
 * @FilePath: \my_mini_vue\src\runtime-core\renderer.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */

// import { isObject } from "../share";
import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "./shapeFlags";
import { Fragment, Text } from "./vnode";
import { createAppAPI } from "./createApp";
import { effect } from "src/reactivity/effect";
import { getSequence } from "src/share";
import { shouldUpdateComponent } from "./componentUpdateUtils";
import { queueJobs } from "./scheduler";

// 传入options，控制如何去创建对象
export function createRenderer(options: any) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

  function render(vnode: VNode, container: HTMLElement) {
    // patch
    patch(null, vnode, container, null, null);
  }
  /**
   * @param vnode
   * @param container
   * @description 挂载
   */
  function patch(
    prev: VNode | null,
    vnode: VNode,
    container: HTMLElement,
    parentComponent: any,
    anchor: any
  ) {
    const { type, shapeFlag } = vnode;
    // process VNode
    switch (type) {
      case Fragment:
        processFragment(prev, vnode, container, parentComponent, anchor);
        break;
      case Text:
        processText(prev, vnode, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(prev, vnode, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFULCOMPONENT) {
          processComponent(prev, vnode, container, parentComponent, anchor);
        }
        break;
    }
  }
  function processText(
    prev: VNode | null,
    vnode: VNode,
    container: HTMLElement
  ) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.appendChild(textNode);
  }
  function processFragment(
    prev: VNode | null,
    vnode: VNode,
    container: HTMLElement,
    parentComponent: any,
    anchor: any
  ) {
    mountChildren(vnode.children, container, parentComponent, anchor);
  }
  function processElement(
    prev: VNode | null,
    vnode: VNode,
    container: HTMLElement,
    parentComponent: any,
    anchor: any
  ) {
    if (prev !== null) {
      patchElement(prev, vnode, container, parentComponent, anchor);
    } else {
      mountElement(vnode, container, parentComponent, anchor);
    }
  }
  function patchElement(
    prev: VNode,
    vnode: VNode,
    container: HTMLElement,
    parentComponent: any,
    anchor: any
  ) {
    // console.log(prev, vnode, container, "patchElement");
    const oldProps = prev.props || {};
    const newProps = vnode.props || {};

    const el = (vnode.el = prev.el);
    patchChildren(prev, vnode, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
  }
  const EMPTY_OBJ = {};
  function patchChildren(
    prev: VNode | null,
    vnode: VNode,
    el: HTMLElement,
    parentComponent: any,
    anchor: any
  ) {
    if (!prev) return;
    const { shapeFlag } = vnode;
    const prevShapeFlag = prev.shapeFlag;
    // 获得两个虚拟节点的children
    const c1 = prev.children;
    const c2 = vnode.children;
    if (shapeFlag & ShapeFlags.TEXTCHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAYCHILDREN) {
        // clear old,set new
        unmountChildren(prev.children);
        hostSetElementText(el, c2);
      } else {
        if (c1 !== c2) {
          hostSetElementText(el, c2);
        }
      }
    } else {
      // new array
      if (prevShapeFlag & ShapeFlags.TEXTCHILDREN) {
        hostSetElementText(el, "");
        mountChildren(c2, el, parentComponent, anchor);
      } else {
        //Array to Array diff
        patchKeyedChildren(c1, c2, el, parentComponent, anchor);
      }
    }
  }
  /**
   * @description compare two vnode
   * @param n1
   * @param n2
   * @returns
   */
  function isSameVNodeType(n1: VNode, n2: VNode) {
    // type
    return n1.type === n2.type && n1.key === n2.key;
    //key
  }
  function patchKeyedChildren(
    c1: any,
    c2: any,
    container: any,
    parentComponent: any,
    parentAnchor: any
  ) {
    const l2 = c2.length;
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    // left diff
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      ++i;
    }
    // right
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    // 新的比老的多
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      // 中间对比  ！！！！！！
      let s1 = i;
      let s2 = i;
      // 新节点的中间段的(VNode.key -> index)
      const keyToNewIndexMap = new Map();
      // toBePatched 即中间段的长度
      const toBePatched = e2 - s2 + 1;
      // (relative newNode.index (start with zero)-> oldNode.index)
      const newIndexToOldIndexMap = new Array(toBePatched);
      // init the map
      newIndexToOldIndexMap.fill(0);
      //
      let moved = false;
      let maxNewIndexSoFar = 0;

      // (newNode -> absolute index)
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }
      // have patched count
      let patched = 0;

      // 处理每一个old child
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        // 如果新节点全被patch完成
        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }
        // 获取newnode的index
        let newIndex;
        // 如果当前结点在新的children中存在
        if (prevChild.key !== null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          // 寻找old child的new index
          for (let j = s2; j <= e2; j++) {
            if (isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }

        // 找不到new index
        if (newIndex === undefined) {
          hostRemove(prevChild.el);
        } else {
          // 发生错序
          if (newIndex < maxNewIndexSoFar) {
            moved = true;
          } else {
            maxNewIndexSoFar = newIndex;
          }
          // 这里不能为0，从1开始
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }
      // 最长递增子序列
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      //  j 为最长上升子序列的长度
      let j = increasingNewIndexSequence.length - 1;
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
        if (newIndexToOldIndexMap[i] === 0) {
          // 新index在旧的index中没有索引
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            // move
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  }
  function unmountChildren(children: any) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      //remove
      hostRemove(el);
    }
  }
  function patchProps(el: HTMLElement, oldProps: any, newProps: any) {
    for (const key in newProps) {
      const pre = oldProps[key];
      const ne = newProps[key];

      if (pre !== ne) {
        hostPatchProp(el, key, pre, ne);
      }
    }
    if (oldProps !== EMPTY_OBJ) {
      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null);
        }
      }
    }
  }
  function processComponent(
    prev: VNode | null,
    vnode: VNode,
    container: HTMLElement,
    parentComponent: any,
    anchor: any
  ) {
    if (!prev) {
      mountComponent(vnode, container, parentComponent, anchor);
    } else {
      updateComponent(prev, vnode);
    }
  }
  function updateComponent(prev: VNode, vnode: VNode) {
    if (shouldUpdateComponent(prev, vnode)) {
      let instance = (vnode.component = prev.component);
      if (!instance) return;
      instance.next = vnode;
      instance.update();
    } else {
      vnode.el = prev.el;
      vnode.vnode = vnode;
    }
  }
  // 挂载dom元素
  function mountElement(
    vnode: VNode,
    container: HTMLElement,
    parentComponent: any,
    anchor: any
  ) {
    // 创建dom对象
    const el: HTMLElement = (vnode.el = hostCreateElement(vnode.type));
    const { children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXTCHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAYCHILDREN) {
      // 渲染vnode下所有的子节点
      mountChildren(vnode.children, el, parentComponent, anchor);
    }
    const { props } = vnode;

    for (const key in props) {
      const val = props[key]; // check format
      hostPatchProp(el, key, null, val);
    }
    // container.appendChild(el);
    hostInsert(el, container);
  }
  /**
   * @description 挂载vnode下所有的子节点
   */
  function mountChildren(
    children: any,
    container: HTMLElement,
    parentComponent: any,
    anchor: any
  ) {
    children.forEach((childVnode: VNode) => {
      patch(null, childVnode, container, parentComponent, anchor);
    });
  }
  /**
   * @description 挂载组件
   */
  function mountComponent(
    InitalVnode: VNode,
    container: HTMLElement,
    parentComponent: any,
    anchor: any
  ) {
    const instance = (InitalVnode.component = createComponentInstance(
      InitalVnode,
      parentComponent
    ));
    setupComponent(instance);
    setupRenderEffect(instance, InitalVnode, container, anchor);
  }

  function setupRenderEffect(
    instance: Instance,
    InitialVnode: VNode,
    container: HTMLElement,
    anchor: any
  ) {
    instance.update = effect(
      () => {
        if (!instance.isMounted) {
          const { proxy } = instance;
          const subTree = (instance.subTree = instance.render.call(proxy));
          //   vnode -> patch
          //   vnode -> element
          patch(null, subTree, container, instance, anchor);
          InitialVnode.el = subTree.el;
          instance.isMounted = true;
        } else {
          console.log("update");
          const { next, vnode } = instance;
          if (next) {
            next.el = vnode.el;
            updateComponentRender(instance, next);
          }
          const { proxy } = instance;
          const subTree = instance.render.call(proxy);
          const preSubTree = instance.subTree;
          patch(preSubTree, subTree, container, instance, anchor);
          InitialVnode.el = subTree.el;
        }
      },
      {
        scheduler() {
          queueJobs(instance.update);
        },
      }
    );
  }
  function updateComponentRender(instance: Instance, nextVnode: VNode) {
    instance.vnode = nextVnode;
    instance.props = nextVnode.props;
    instance.next = null;
  }
  // 闭包导出function
  return {
    createApp: createAppAPI(render),
  };
}

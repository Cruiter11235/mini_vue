/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-01 14:49:42
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-06 20:52:53
 * @FilePath: \my_mini_vue\src\runtime-core\component.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
import { PublicInstanceProxyHandlers } from "./componentPulicInstance";
import { initProps } from "./componentProps";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initSlots } from "./componentSlots";
import { ProxyRefs } from "../reactivity/ref";
export function createComponentInstance(vnode: VNode, parent: any) {
  const component: Instance = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => {},
    slots: {},
    parent: parent || {},
    provides: parent?.provides || {},
    isMounted: false,
    subTree: null,
    proxy: null,
    next: null,
  };
  component.emit = emit.bind(null, component);
  return component;
}
/**
 *
 * @param instance
 * @description: 初始化Instance,去给Instance下加一些东西
 */
export function setupComponent(instance: Instance) {
  initProps(instance, instance.vnode.props);
  initSlots(instance, instance.vnode.children);
  setupStatefulComponent(instance);
}
/**
 * @description: 初始化组件的状态
 */
function setupStatefulComponent(instance: Instance) {
  const Component = instance.type;
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
  //   get setup
  const { setup } = Component;

  if (setup) {
    setcurrentInstance(instance);
    const setupResult = setup(
      instance.props && shallowReadonly(instance.props),
      { emit: instance.emit }
    );
    setcurrentInstance(null);
    handleSetupResult(instance, setupResult);
  }
}
/**
 * @description 根据`setup`的返回值来初始化`Instance`的`setupState
 */
function handleSetupResult(instance: Instance, setupResult: any) {
  if (typeof setupResult === "object") {
    instance.setupState = ProxyRefs(setupResult);
  }

  finishComponentSetup(instance);
}
/**
 * @description: 挂载render函数到Instance上
 */
function finishComponentSetup(instance: Instance) {
  const Component = instance.type;
  if (Component.render) {
    instance.render = Component.render;
  }
}

let currentInstance: Instance | null = null;
export function getcurrentInstance() {
  return currentInstance;
}
function setcurrentInstance(instance: Instance | null) {
  currentInstance = instance;
}

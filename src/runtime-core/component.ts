import { PublicInstanceProxyHandlers } from "./componentPulicInstance";
import { initProps } from "./componentProps";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initSlots } from "./componentSlots";
export function createComponentInstance(vnode: VNode) {
  const component: Instance = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => {},
    slots: {},
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
    instance.setupState = setupResult;
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

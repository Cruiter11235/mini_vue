import { PublicInstanceProxyHandlers } from "./componentPulicInstance";

export function createComponentInstance(vnode: VNode) {
  const component: Instance = {
    vnode,
    type: vnode.type,
  };
  return component;
}
/**
 *
 * @param instance
 * @description: 初始化Instance,去给Instance下加一些东西
 */
export function setupComponent(instance: Instance) {
  // initProps(instance)
  // initSlots(instance)

  setupStatefulComponent(instance);
}
/**
 * @description: 初始化组件的状态
 */
function setupStatefulComponent(instance: Instance) {
  const Component = instance.type;
  instance.proxy = new Proxy(
    { _: instance },
    PublicInstanceProxyHandlers
  );
  //   get setup
  const { setup } = Component;

  if (setup) {
    const setupResult = setup();
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

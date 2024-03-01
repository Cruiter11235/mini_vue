import { hasOwn } from "../share/index";
const PublicPropertiesMap: StringKey = {
  $el: (i: Instance) => i.vnode.el,
  $slots: (i: Instance) => i.slots,
  $props: (i: Instance) => i.props,
};
export const PublicInstanceProxyHandlers: ProxyHandler<any> = {
  get({ _: instance }, key: string) {
    const { setupState, props } = instance;
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }
    const PublicGetter = PublicPropertiesMap[key];
    if (PublicGetter) {
      return PublicGetter(instance);
    }
  },
};

const PublicPropertiesMap: StringKey = {
  $el: (i: Instance) => i.vnode.el,
};

export const PublicInstanceProxyHandlers: ProxyHandler<any> = {
  get({ _: instance }, key: string) {
    const { setupState } = instance;
    if (key in setupState) {
      return setupState[key];
    }
    const PublicGetter = PublicPropertiesMap[key];
    if (PublicGetter) {
      return PublicGetter(instance);
    }
  },
};

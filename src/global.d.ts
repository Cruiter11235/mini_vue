interface VNode {
  type: any;
  props?: any;
  children?: any;
  el?: HTMLElement | null;
}
interface Instance {
  vnode: VNode;
  type: any;
  proxy?: any;
  setupState?: any;
  render?: any;
}
type StringKey = Record<string, any>;
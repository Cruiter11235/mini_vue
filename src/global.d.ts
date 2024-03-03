interface VNode {
  type: any;
  props?: any;
  children?: any;
  el?: HTMLElement | null | any;
  shapeFlag: number;
}
interface Instance {
  vnode: VNode;
  type: any;
  proxy?: any;
  setupState: any;
  render?: any;
  props: any;
  emit: Function = () => {};
  slots?: any;
}
type StringKey = Record<string, any>;

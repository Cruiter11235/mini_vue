import { ShapeFlags } from "./shapeFlags";
import { Fragment, createVNode } from "./vnode";

export function initSlots(instance: Instance, children: any) {
  const { vnode } = instance;
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance.slots);
  }
}
function normalizeObjectSlots(children: any, slots: any) {
  for (const key in children) {
    const value = children[key];
    slots[key] = (props: any) => normalizeSlotsValue(value(props));
  }
}
export function renderSlots(slots: any, name: PropertyKey, props: any) {
  const slot = slots[name];
  if (typeof slot === "function") {
    return createVNode(Fragment, {}, slot(props));
  }
}
function normalizeSlotsValue(value: any) {
  return Array.isArray(value) ? value : [value];
}

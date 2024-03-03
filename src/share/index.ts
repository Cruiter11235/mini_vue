export * from "../reactivity/index";
export function hasOwn(obj: Object, key: PropertyKey) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

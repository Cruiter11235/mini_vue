export function hasOwn(obj: Object, key: PropertyKey) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
export const extend = Object.assign;
export function isObject(val: any) {
  return val !== null && typeof val === "object";
}
export function hasChanged(oldValue: any, newValue: any) {
  return !Object.is(oldValue, newValue);
}

class Stack<T> {
  public items: T[];
  constructor() {
    this.items = [];
  }
  size() {
    return this.items.length;
  }
  empty() {
    return this.items.length === 0;
  }
  push_back(item: T) {
    this.items.push(item);
  }
  pop() {
    return this.items.pop();
  }
  public top() {
    return this.items[this.items.length - 1];
  }
}
export function getSequence(arr: number[]): number[] {
  let stack = new Stack<number>();
  let res: number[] = [];
  arr.forEach((i) => {
    while (!stack.empty() && stack.top() > i) {
      stack.pop();
    }
    stack.push_back(i);
    res = res.length < stack.size() ? stack.items : res;
  });

  return res;
}

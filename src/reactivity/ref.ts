import { trackEffect, triggerEffects, tracking } from "./effect";
import { hasChanged, isObject } from "../share";
import { reactive } from "./reactive";
class RefImpl {
  private __value: any;
  public dep: Set<any>;
  private __rawValue: any;
  public __isRef = true;
  constructor(value: any) {
    this.__rawValue = value;
    this.__value = convert(value);
    this.dep = new Set();
  }
  get value() {
    trackRefValue(this);
    return this.__value;
  }
  set value(newValue: any) {
    if (!hasChanged(this.__rawValue, newValue)) return;
    this.__value = convert(newValue);
    this.__rawValue = newValue;
    triggerEffects(this.dep);
  }
}
function convert(value: any) {
  return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref: RefImpl) {
  if (tracking()) {
    trackEffect(ref.dep);
  }
}
export function isRef(obj: any) {
  return !!obj.__isRef;
}

export function ref(value: any) {
  return new RefImpl(value);
}
export function unRef(obj: any) {
  return isRef(obj) ? obj.value : obj;
}
export function ProxyRefs(obj: any) {
  return new Proxy(obj, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      if (isRef(Reflect.get(target, key)) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}

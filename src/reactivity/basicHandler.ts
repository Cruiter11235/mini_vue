/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-02-27 19:10:23
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-05 10:32:51
 * @FilePath: \my_mini_vue\src\reactivity\basicHandler.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
import { track, trigger } from "./effect";
import { reactive, readonly } from "./reactive";
import { extend, isObject } from "../share";
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly: Boolean = false, shallow = false) {
  return (target: any, key: any) => {
    if (!isReadonly) {
      if (key === "__isReactive") return true;
      if (key === "__isReadonly") return false;
      track(target, key);
    } else {
      if (key === "__isReactive") return false;
      if (key === "__isReadonly") return true;
    }
    const res = Reflect.get(target, key);
    if (isObject(res) && !shallow) {
      return isReadonly ? readonly(res) : reactive(res);
    }
    return res;
  };
}

function createSetter() {
  return (target: any, key: any, value: any) => {
    const res = Reflect.set(target, key, value);
    // trigger 刷新依赖
    trigger(target, key);
    return res;
  };
}

export const MutibleHandler = {
  get: get,
  set: set,
};
export const ReadonlyHandler = {
  get: readonlyGet,
  set: (target: any, key: any, value: any) => {
    console.warn("readonly object can't be modified");
    return true;
  },
};
export const ShallowReadonlyHandler = extend({}, ReadonlyHandler, {
  get: shallowReadonlyGet,
});

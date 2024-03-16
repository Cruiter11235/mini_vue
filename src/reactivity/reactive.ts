/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-02-26 10:13:54
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-02-29 13:08:12
 * @FilePath: \my_mini_vue\src\reactivity\reactive.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
import {
  MutibleHandler,
  ReadonlyHandler,
  ShallowReadonlyHandler,
} from "./basicHandler";

enum ReactiveFlags {
  IS_REACTIVE = "__isReactive",
  IS_READONLY = "__isReadonly",
}
function createActiveObject(raw: any, handler: any) {
  return new Proxy(raw, handler);
}
// create reactive proxy object
export function reactive(raw: any) {
  return createActiveObject(raw, MutibleHandler);
}
//create readonly proxy object
export function readonly(raw: any) {
  return createActiveObject(raw, ReadonlyHandler);
}

export function shallowReadonly(raw: any) {
  return createActiveObject(raw, ShallowReadonlyHandler);
}

export function isReactive(obj: any) {
  return !!obj[ReactiveFlags.IS_REACTIVE];
}
export function isReadonly(obj: any) {
  return !!obj[ReactiveFlags.IS_READONLY];
}
export function isProxy(val: any) {
  return isReactive(val) || isReadonly(val);
}

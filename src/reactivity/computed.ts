/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-02-29 22:27:14
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-01 14:17:43
 * @FilePath: \my_mini_vue\src\reactivity\computed.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
import { ReactiveEffect } from "./effect";

class computedRefImpl {
  //   private __getter: Function;
  private __dirty: boolean = true;
  private __value: any;
  private __effect: ReactiveEffect;
  constructor(getter: any) {
    // this.__getter = getter;
    // 利用
    this.__effect = new ReactiveEffect(getter, () => {
      if (!this.__dirty) {
        this.__dirty = true;
      }
    });
  }
  get value() {
    if (this.__dirty) {
      this.__dirty = false;
      this.__value = this.__effect.run();
    }
    return this.__value;
  }
}
export function computed(getter: any) {
  return new computedRefImpl(getter);
}

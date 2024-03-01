/*
import { effect } from './effect';
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-02-26 11:07:45
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-06 11:38:34
 * @FilePath: \my_mini_vue\src\reactivity\effect.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */

let activeEffect: ReactiveEffect | null;
let shouldTrack: boolean;

function cleanupEffect(effect: any) {
  // 防止重复清空
  if (effect.active == false) return;
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
  effect.active = false;
}
export class ReactiveEffect {
  private _fn: any;
  public scheduler: Function | undefined;
  public deps:any[] = [];
  public active: boolean = true;
  constructor(fn: any, scheduler?: any) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    if (!this.active) {
      return this._fn();
    }
    // 进入到下面一定是set时触发的或者是effect
    activeEffect = this;
    // 准备收集依赖
    shouldTrack = true;
    const result = this._fn();

    // 恢复shouldTrack为false
    shouldTrack = false;
    return result;
  }
  stop() {
    if (this.active) {
      cleanupEffect(this);
      this.active = false;
    }
  }
}
const targetMap = new Map();
export function track(target: any, key: any) {
  if (tracking() == false) return;

  let depMap = targetMap.get(target) || new Map();
  targetMap.set(target, depMap);
  const dep = depMap.get(key) || new Set();
  depMap.set(key, dep);
  trackEffect(dep);
}
export function trackEffect(dep: any) {
  if (!dep.has(activeEffect)) dep.add(activeEffect);
  if (
    activeEffect &&
    Object.prototype.hasOwnProperty.call(activeEffect, "deps") &&
    Array.isArray(activeEffect.deps)
  ) {
    activeEffect.deps.push(dep);
  }
}
export function trigger(target: any, key: any) {
  let depMap = targetMap.get(target);
  let dep = depMap.get(key);
  triggerEffects(dep);
}
export function triggerEffects(dep: any) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function tracking() {
  return shouldTrack == true && activeEffect != null;
}

export function effect(fn: any, options: any = {}) {
  const scheduler = options?.scheduler;
  const _effect = new ReactiveEffect(fn, scheduler);
  _effect.run();
  const runner = _effect.run.bind(_effect);
  //   反向绑定effect
  // Object.assign(runner, _effect);
  Object.defineProperty(runner, "effect", { value: _effect });
  // runner.effect = _effect;
  return runner;
}

export function stop(runner: { (): any; effect?: any }) {
  runner.effect.stop();
}

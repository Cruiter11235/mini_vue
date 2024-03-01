/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-02-26 11:16:07
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-02-27 20:33:35
 * @FilePath: \my_mini_vue\src\reactivity\__test__\effect.test.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
import { effect, stop } from "../effect";
import {reactive} from "../reactive";
import { vi } from "vitest";
describe("effect", () => {
  it("测试依赖收集和正向刷新", () => {
    let user = reactive({
      age: 10,
    });
    let nextage;
    effect(() => {
      nextage = user.age + 1;
    });
    expect(nextage).toBe(11);

    user.age++;
    expect(nextage).toBe(12);
  });

  it("测试返回runner(fn)", () => {
    let foo = 10;
    let runner = effect(() => {
      foo += 1;
      return "foo";
    });
    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12);
  });

  it("测试scheduler", () => {
    let dummy;
    let run: any;
    const scheduler = vi.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        scheduler,
      }
    );
    vi.fn(() => {});

    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(1);
    run();
    expect(dummy).toBe(2);
  });

  it("测试stop", () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    // 执行set方法，shouldTrack变为false
    obj.prop = 2;
    expect(dummy).toBe(2);
    // currentEffect.active = false
    stop(runner);
    obj.prop++;
    expect(dummy).toBe(2);
    // 重新执行
    runner();
    expect(dummy).toBe(3);
  });
});

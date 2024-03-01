/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-02-26 10:10:09
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-02-29 12:26:45
 * @FilePath: \my_mini_vue\src\reactivity\__test__\reactive.test.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
import { effect } from "../effect";
import { reactive, isReactive, readonly, isProxy } from "../reactive";

describe("reactive", () => {
  it("happy path", () => {
    const ori = { name: "ori" };
    const observed = reactive(ori);
    expect(observed).not.toBe(ori);

    expect(observed.name).toBe("ori");
  });

  it("isReactive", () => {
    const ori = { name: "ori" };
    const observed = reactive(ori);
    const readonlyObserved = readonly(observed);
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(readonlyObserved)).toBe(false);
  });

  it("reactive 嵌套", () => {
    const ori = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    };
    const observed = reactive(ori);

    let foo;
    effect(() => {
      foo = observed.nested.foo;
    });
    observed.nested.foo = 2;
    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
    expect(isProxy(observed)).toBe(true);
    expect(isProxy(observed.nested)).toBe(true);
    expect(foo).toBe(2);
  });
});

/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-02-29 12:33:29
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-02-29 13:03:10
 * @FilePath: \my_mini_vue\src\reactivity\__test__\shallowReadonly.test.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
import { shallowReadonly } from "../reactive";
import { effect } from "../effect";
describe("shallowReadonly", () => {
  it("非递归监听", () => {
    let wrapper = shallowReadonly({ nested: { foo: 1 } });
    let obj = null;
    effect(() => {
      obj = wrapper.nested;
    });
    wrapper.nested = { foo: 2 };
    expect(obj).toEqual({ foo: 1 });
  });
});

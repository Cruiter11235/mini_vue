import { effect } from "../effect";
import { reactive, readonly } from "../reactive";
import { vi } from "vitest";
/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-02-27 12:14:22
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-02-27 19:27:24
 * @FilePath: \my_mini_vue\src\reactivity\__test__\readonly.test.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
describe("readonly", () => {
  it("不可被effect修改", () => {
    let ori = { foo: 1, bar: { baz: 2 } };
    let wrapper = readonly(ori);
    expect(wrapper).not.toBe(ori);
    expect(wrapper.foo).toBe(1);
  });

  it("调用readonly的set时提交一个警告", () => {
    console.warn = vi.fn();
    let ori = { foo: 1, bar: { baz: 2 } };
    let wrapper = readonly(ori);
    wrapper.foo = 2;
    expect(console.warn).toHaveBeenCalled();
  });
});

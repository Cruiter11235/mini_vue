import { reactive } from "../reactive";
import { computed } from "../computed";
import { vi } from "vitest";
describe("computed", () => {
  it("happy path", () => {
    const user = reactive({
      age: 1,
    });
    const age = computed(() => {
      return user.age;
    });
    expect(age.value).toBe(1);
  });

  it("it should be called lazily", () => {
    const value = reactive({
      foo: 1,
    });
    const getter = vi.fn(() => {
      return value.foo;
    });
    // 此时activeEffect为getter的代码，不创建新的effect它是不会变的
    const cValue = computed(getter);
    expect(getter).not.toHaveBeenCalled();

    // effect.run 会调用getter, dirty = false
    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalled();

    // should not be computed again
    // 调用effect.run()，dirty = false，不会再次调用getter，直接返回value
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);
    //完成了依赖收集和刷新，第二次调用时是schedule，变脏了
    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);

    // 变脏了，调用effect.run()，dirty = false，调用getter
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);
  });
});

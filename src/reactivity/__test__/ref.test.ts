import { effect } from "../effect";
import { ref, isRef, unRef, ProxyRefs } from "../ref";
describe("ref", () => {
  it("happy path", () => {
    const a = ref(1);
    expect(a.value).toBe(1);
  });

  it("具有响应能力", () => {
    const a = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls++, (dummy = a.value);
    });
    expect(calls).toBe(1);
    expect(dummy).toBe(1);
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
    a.value = 2;
    // same value should not trigger
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  });

  it("should make nested properties reactive", () => {
    let cnt = 0;
    let ori = { count: 1 };
    const a = ref(ori);
    let dummy;
    effect(() => {
      dummy = a.value.count;
      cnt++;
    });
    expect(dummy).toBe(1);
    expect(cnt).toBe(1);
    a.value = ori;
    expect(dummy).toBe(1);
    expect(cnt).toBe(1);

    a.value.count = 2;
    expect(cnt).toBe(2);
  });

  it("测试isRef和unRef", () => {
    let a = ref(1);
    expect(isRef(a)).toBe(true);
    expect(isRef(unRef(a))).toBe(false);
  });

  it("ProxyRef", () => {
    const user = {
      age: ref(10),
      name: "xiaohong",
    };

    const ProxyUser = ProxyRefs(user);
    expect(user.age.value).toBe(10);
    expect(ProxyUser.age).toBe(10);
    expect(ProxyUser.name).toBe("xiaohong");

    ProxyUser.age = 20;
    expect(user.age.value).toBe(20);
    expect(ProxyUser.age).toBe(20);
  });
});

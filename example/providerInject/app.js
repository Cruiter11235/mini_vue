import { h, provide, inject } from "../../lib/guide-mini-vue.esm.js";
const Provider = {
  name: "Provider",
  setup() {
    console.log("setup");
    provide("foo2", "fooVal2");
    provide("bar2", "barVal2");
  },
  render() {
    return h("div", {}, [h("p", {}, `Provider`), h(Provider2)]);
  },
};
const Provider2 = {
  name: "Probider",
  setup() {
    provide("foo", "fooVal");
    provide("bar", "barVal");
  },
  render() {
    return h("div", {}, [h("p", {}, "Provider"), h(Consumer)]);
  },
};
const Consumer = {
  name: "Consumer",
  setup() {
    const foo2 = inject("foo2");
    const bar2 = inject("bar2");
    const foo = inject("foo");
    const bar = inject("bar");
    const defaultValue = inject("defaultValue", () => `${foo}-default`);
    return {
      foo2,
      bar2,
      foo,
      bar,
      defaultValue,
    };
  },
  render() {
    return h("div", {}, [
      h("div", {}, `Consumer: - ${this.foo2} - ${this.bar2}`),
      h("div", {}, `Consumer: - ${this.foo} - ${this.bar}`),
      h("div", {}, `Consumer: - ${this.defaultValue}`),
    ]);
  },
};
export default {
  name: "App",
  setup() {},
  render() {
    return h("div", {}, [h(Provider), h("div", {}, "ApiInject")]);
  },
};

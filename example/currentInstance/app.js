import { h, getcurrentInstance } from "../../lib/guide-mini-vue.esm.js";
export const App = {
  setup() {
    console.log(getcurrentInstance());
    return {};
  },
  render() {
    return h("div", {}, "hello");
  },
};

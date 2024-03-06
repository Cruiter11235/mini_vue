import { h, ref, ProxyRefs } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  name: "App",
  setup() {
    const count = ref(0);
    let msg = ref("foo");
    setInterval(() => {
      msg.value = "bar" + count.value;
      console.log(msg.value);
      count.value++;
    }, 1000);
    return {
      count,
      msg,
    };
  },
  render() {
    // console.log(this.msg);
    return h("div", { msg: this.msg }, this.msg);
  },
};

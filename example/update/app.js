import { h, ref, ProxyRefs, nextTick } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  name: "App",
  setup() {
    const count = ref(0);
    let msg = ref("foo");
    // setInterval(() => {
    //   msg.value = "bar" + count.value;
    //   console.log(msg.value);
    //   count.value++;
    // }, 1000);
    msg.value = "bar" + count.value;
    for (let i = 0; i < 100; i++) {
      count.value++;
    }
    nextTick(() => {
      console.log(count.value);
      msg.value = "bar" + count.value;
    });
    return {
      count,
      msg,
    };
  },
  render() {
    // console.log(this.msg);
    console.log(this.$props);
    return h("div", { msg: this.msg }, this.msg);
  },
};

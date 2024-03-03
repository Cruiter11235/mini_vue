import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";
export const Foo = {
  setup(props, { emit }) {
    // props.count++;
    // const emitAdd = (args) => {
    //   return;
    // };
    // return { emitAdd };
    const emitAdd = () => {
      console.log("emitAdd");
      emit("add", 1, 2);
      emit("add-foo");
    };
    return { emitAdd };
  },
  render() {
    console.log(this.$slots);
    const btn = h(
      "button",
      {
        onClick: this.emitAdd,
      },
      "emitAdd"
    );
    const foo = h("p", {}, "foo");
    return h("div", {}, [
      btn,
      renderSlots(this.$slots, "header", "1"),
      foo,
      renderSlots(this.$slots, "footer", "zjj"),
    ]);
  },
};

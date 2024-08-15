import { NodeType } from "../ast";
import { baseParse } from "../parser";
import { transform } from "../transform";
describe("transform", () => {
  it("happty path", () => {
    const ast = baseParse("<div>hi,{{message}}</div>");
    // transform 函数
    const plugin = (node: any) => {
      if (node.type === NodeType.TEXT) {
        node.content = node.content + "mini-vue";
      }
    };
    //
    transform(ast, {
      nodeTransforms: [plugin],
    });
    const nodeText = ast.children[0].children[0];
    expect(nodeText.content).toBe("hi,mini-vue");
  });
});

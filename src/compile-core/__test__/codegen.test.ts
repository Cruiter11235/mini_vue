import { generator } from "../codegen";
import { baseParse } from "../parser";
import { transform } from "./../transform";
import { transformExpression } from "./../transformExpression";

describe("codegen", () => {
  it("string", () => {
    const ast = baseParse("hi");
    transform(ast);
    const { code } = generator(ast);
    expect(code).toMatchSnapshot();
  });
  it("interpolation", () => {
    const ast = baseParse("{{message}}");
    transform(ast, {
      nodeTransforms: [transformExpression],
    });
    const { code } = generator(ast);
    expect(code).toMatchSnapshot();
  });
  it("element", () => {
    const ast = baseParse("<div>hi,{{mini-vue}}</div>");
    transform(ast, {
      nodeTransforms: [transformExpression],
    });
    console.log(ast);
    const { code } = generator(ast);
  });
});
